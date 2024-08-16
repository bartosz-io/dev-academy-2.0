# How to Secure AWS Lambda?

AWS Lambda allows you to run code without having to manage server infrastructure. It’s a serverless service, meaning users don’t have to worry about configuring, scaling, or maintaining servers — Lambda automatically manages those aspects within the AWS environment. Before I show you how to secure a lambda during development, I’ll start with a quick introduction, based on [AWS documentation](https://docs.aws.amazon.com/pdfs/whitepapers/latest/security-overview-aws-lambda/security-overview-aws-lambda.pdf#lambda-functions-and-layers), to help you better understand the lambda service itself.

![Isolation model for AWS Lambda Workers](https://lh7-rt.googleusercontent.com/docsz/AD_4nXexiuKkV8O2wTTLo76M-IjqDDTPeJLk-q9CZH6a7K71_GVk8_6um_SEdMv4qtys9I-0Fi55UvTyFFRX3AzwXTDuy_L4zOyTy2lxx5VKOtKeB1eU-h8r33Mwcde1OY6xgILtQoyRvjq2tMHDZ0D4qdD7RPnx?key=rVKrseBMJ4NB4mIqiDOmrw)

Each function runs in a dedicated environment isolated by a micro-virtual machine (MicroVM), ensuring that code from one function cannot impact other functions. Isolation is handled by [Firecracker](https://aws.amazon.com/blogs/opensource/firecracker-open-source-secure-fast-microvm-serverless/), an open-source virtual machine monitor designed specifically for serverless services and containers. Firecracker creates and manages micro-virtual machines that are isolated not only by hardware, but also by other technologies such as cgroups, namespaces, seccomp-bpf, iptables, routing tables, and chroot, providing a strong and comprehensive security boundary. Additional layers of security include an internal sandbox and a jailer system, which give more protection. The internal sandbox is used to restrict access to certain parts of the system kernel, making certain types of attacks more difficult and increasing the system’s resilience to threats. The jailer system further restricts the ability of Firecracker processes to execute code, even if other isolation layers are breached.

**Good to know:**

AWS Lambda also offers container support functionality, which introduces new challenges and opportunities in terms of security. To support larger container images (up to 10 GB), Lambda uses the Sparse file system, which dynamically loads only the parts of the image that are needed, minimizing startup time and increasing performance. Through integration with AWS KMS, Lambda ensures that data is always encrypted in transit and at rest. Additionally, Lambda optimizes container images by deduplication of data using cryptographic methods, which saves space while ensuring security.

## Why is Lambda security critical to running cloud applications?

Lambda often processes data that may be confidential or sensitive, such as personal, financial, or medical data. Improperly secured functions can become the target of attacks, which can ultimately lead to privacy violations, data theft, and serious legal and financial consequences. Securing Lambda functions helps protect data from unauthorized access and manipulation. In addition, this function can be called by other AWS services, such as Amazon API Gateway, S3, or DynamoDB, making them a potential target for external attacks such as DDoS or SQL Injection. These attacks, or other malicious activities, can disrupt the operation of the application or allow access to unauthorized users to the system. Therefore, Lambda must be secured with appropriate authentication, authorization, and monitoring mechanisms, which minimizes the risk of attacks.

## Lambda in numbers 

Lambda offers flexible resource configuration and support for multiple programming languages, including Python, Ruby, Java, Go, and C#, making it a powerful tool for developers. Each Lambda function runs in a specific execution environment, that is well-isolated, minimizing the risk of functions influencing each other (as discussed in the introduction). An example is the Python 3.12 runtime, where each function runs in its separate context, providing an additional layer of protection.

Lambda functions have direct control over the amount of allocated memory, which can be configured in 1 MB increments, starting from 128 MB up to 10,240 MB. As the memory increases, so does the number of vCPUs available to the function, which positively affects its performance. Lambda also provides access to temporary disk space, configurable between 512 MB and 10 GB, accessible as the /tmp directory, allowing for the storage of temporary files during the function's execution. Another important aspect is the maximum execution timeout for a function, which is 900 seconds (15 minutes), a critical consideration when planning more computationally intensive operations.

## Creating identity and access management policies and roles

From a security perspective, **Lambda Resource Policy** plays a key role, in controlling which AWS services compute resources, and accounts can invoke a given function. These policies allow you to precisely define who and what can run Lambda code, preventing unauthorized access to security vulnerabilities. IAM policies are also essential for achieving compliance with regulatory standards like PCI, GDPR, and HIPAA, ensuring that your security practices support successful audits.

### **Example**

Adding a resource policy that allows Lambda functions to be called via S3.

```
aws lambda add-permission \
  --function-name MySecureFunction \
  --principal s3.amazonaws.com \
  --statement-id s3-invoke-permission \
  --action "lambda:InvokeFunction" \
  --source-arn arn:aws:s3:::my-secure-bucket \
  --source-account 123456789111
```

This command adds a resource policy to the Lambda function that allows Amazon S3 to invoke the function only when the action comes from a specific bucket and AWS account.

* [More on Lambda Resource Policy](https://docs.aws.amazon.com/lambda/latest/dg/access-control-resource-based.html)

The **Execution Role** is another important security element, controlling a function's access to AWS resources and services. A best practice when creating roles and policies is to use the principle of least privilege, ensuring that a function only has access to those cloud resources, that are necessary, which reduces the risk of unauthorized access to other resources in the cloud.

### **Example**

Creating an Execution Role that allows you to log in to CloudWatch and access S3.

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:us-west-2:123456789012:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-secure-bucket/*"
    }
  ]
}
```

The above JSON file shows an IAM policy that allows the Lambda function to create log groups, and log streams, and put log events in any log group, in Amazon CloudWatch, in that region in the specified account, and also the lambda function code access all objects stored in the S3 bucket named my-bucket. So the Lambda function has permission to fetch and write objects in that particular bucket.

* [More on IAM Roles for Lambdas](https://docs.aws.amazon.com/lambda/latest/dg/lambda-intro-execution-role.html)

* [IAM JSON Policy Elements ](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_action.html)

## Storing and accessing secrets

AWS Secrets Manager is a managed service that enables you to securely store, manage, and access sensitive information such as API keys, passwords, database connection details, and other sensitive data used by your applications. Using Secrets Manager helps minimize the risks associated with hard-coding secrets into your applications and simplifies the management, security responsibilities controlling access, and rotation of those secrets.

**Benefits:**

* Secrets are stored securely, using encryption at rest using AWS Key Management Service (KMS).

* Secrets Manager enables automatic rotation of secrets, reducing the risk of abuse due to leaked or outdated credentials.

* Ability to precisely manage access to secrets using IAM policies.

* Integration with AWS CloudTrail enables monitoring and auditing of access to secrets. Security teams benefit from these features by having the necessary tools to handle sensitive information effectively, enhancing their threat detection and incident response capabilities.

## **Storing a secret in AWS Secrets Manager**

### **1. Adding a secret to AWS Secrets Manager**

Suppose we want to store the database password in AWS Secrets Manager.

**Step 1**: Log in to your AWS console and go to the **Secrets Manager** section.

**Step 2**: Click "Store a new secret", select the secret type (e.g. **Other type of secret**), and then enter the key-value pair for the secret:

* **Key**: db_password

* **Value**: MySecurePassword123

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXe2W2cB04EWzJ9bAr3eWd5jHog9V3xNAEVbPGAx2hx0Sg49jIf1giwXns5j2e23tFZlwWryHLXbQgArfSJFKgnki__VhAsVgTt4vkra03PMdZhUdorAAA27JKgrW4k8bqftkBPGOl_sUwRG7GA2HpycDWah?key=rVKrseBMJ4NB4mIqiDOmrw)

**Step 3**: Choose a name for your secret, e.g. MyDatabaseSecret, then complete the process by clicking "Store".

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXehxPDm012rFUHChY28QwtI7e6oXef4Ggt70wH9DisiVpvx0i9efKB9ILxGoQrnATYsN_7wvQeoM1taf83h367gZwlY5ov21XST4w-EzW1p_qT0qL-DNllQwhVwQUClkfB4i4ju0K2hxs2qSnDKl4xWLT5b?key=rVKrseBMJ4NB4mIqiDOmrw)

### **2. Accessing a Secret from AWS Lambda**

To control access to a secret from a Lambda function, we first need to assign the function code appropriate IAM role that will allow access to that secret.

```
{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": "secretsmanager:GetSecretValue",
        "Resource": "arn:aws:secretsmanager:us-west-2:YOUR_ACCOUNT_ID:secret:MyDatabaseSecret-*"
      }
    ]
  }
```

#### **Sample Python code to get the secret**

```
import boto3
import json
from botocore.exceptions import ClientError

def get_secret():
    secret_name = "MyDatabaseSecret"
    region_name = "eu-west-2"

    # Creating a client to support Secrets Manager
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )
    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        raise Exception("Error getting secret: {}".format(e))

    # The secret is stored in the SecretString field
    secret = get_secret_value_response['SecretString']
    secret_dict = json.loads(secret)
    return secret_dict['db_password']

# Using a secret in a Lambda function
db_password = get_secret()
print("The password for the database:", db_password)
```

* We use [Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/lambda.html) libraries which leverage Execution Role to connect to the Secrets Manager service in the selected region.

* The get_secret_value call retrieves the secret from the Secrets Manager. The data is returned in JSON format, which we then parse to get the password value.

## Automatic secret rotation 

AWS Secrets Manager enables the automatic rotation of secrets, which increases the security of stored data. We can configure automatic rotation so that Secrets Manager regularly changes the password in the database and updates it in the system. However, remember that secret rotation itself is only part of the process. You should also make sure that the application or system that uses the secret can dynamically update credentials. This can be achieved, for example, by configuring a Lambda function that not only handles the rotation process in Secrets Manager but also updates the password in the database and notifies applications to reload the secret.

To configure automatic rotation, select the secret in the Secrets Manager console, and then click “Enable automatic rotation”. Select the rotation interval (e.g. every 30 days) and configure the appropriate Lambda function that will handle the rotation process and update the credentials in the system. You can set this change both when creating a new secret for storage and after it has been created.

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXcEkC52NUGWAo9NQf0gOM_9kWZcbM7IuKy18redNR3nQZx1vNoVusEsBnhKwdeYZEjRCuSDwJ1ng3Jgs84SpGZEBm5Pr5xJ19RI88h4w4ah8H0Y7eRVefg86zMZLTUZQjfsffKz7x3iUL8qvK-Nrz8qzh7I?key=rVKrseBMJ4NB4mIqiDOmrw)

## Monitoring and auditing access to secrets

AWS CloudTrail allows you to track who accessed secrets in AWS Secrets Manager and when. Every access to a secret (e.g., through a Lambda function) is recorded in CloudTrail logs, enabling you to monitor unauthorized access attempts or conduct post-incident security analysis.

![](https://lh7-rt.googleusercontent.com/docsz/AD_4nXfrDjCLtoC2NG_U1C6vOlLkLAcZBnpurLVQZ3VjsKmynXrhOXERhKZwOK7J6ub0IO3EtpUFvz_ymvy2rANULaDvb6ubphobAYqIMT-ykWEOJ-eKbX0C1kaJTJmsSsJSPZf8Gr1Q7hPMpl4YiGlM5Zlnn40?key=rVKrseBMJ4NB4mIqiDOmrw)

## Lambda Best Practices 

 1. **Principle of Least Privilege -** ensure that your Lambda functions have only the permissions that are necessary for their operation. Avoid granting broad permissions, such as \* in IAM policies.

 2. **Identity and Access Management (IAM) -** use IAM roles to restrict access to AWS resources. Each Lambda function should be assigned a dedicated IAM role with precisely defined permissions.

 3. **Data Encryption -** always encrypt data stored in AWS (e.g., S3, RDS) and data transmitted between services. AWS KMS (Key Management Service) can be used to manage encryption keys.

 4. **Secure Storage of Environment Variables -** do not store sensitive data, such as passwords, API keys, or access credentials, directly in environment variables. Use AWS Secrets Manager or SSM Parameter Store for secure storage of such information.

 5. **Monitoring and Logging -** configure monitoring and logging using AWS CloudWatch. Use Lambda logs to monitor and analyze events, errors, and other issues. You can also set up alarms based on CloudWatch metrics.

 6. **Limiting Function Size and Execution Time -** set appropriate timeouts for Lambda functions to avoid long-running operations that could lead to resource exhaustion or DoS attacks. Optimize the function’s code to minimize its execution time and the deployment package size.

 7. **Secure Use of Libraries and Dependencies -** regularly update all dependencies and libraries to ensure they do not contain known vulnerabilities. Consider using tools like AWS CodeGuru or Snyk to scan code and dependencies for security issues.

 8. **Protection Against Code Injection -** avoid code injection by thoroughly validating and sanitizing all input data, regardless of its source.

 9. **Secure VPC Configuration -** if your Lambda function requires access to resources in a private network (VPC), ensure it is properly configured using security groups and access control lists (NACLs). Minimize access to public IP addresses if possible.

10. **Automated Security Testing -** regularly conduct automated security tests and scans to ensure that your Lambda functions meet the latest standards and best practices.

11. **Secure Versioning and Environments -** use versioning for Lambda functions to easily revert to previous versions in case of security issues. Also, use separate environments (e.g., Development, Staging, Production) to isolate test environments from production.

12. **Secure Use of [Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/chapter-layers.html) -** use Lambda Layers cautiously, ensuring that you use only trusted sources or your layers. Regularly update layers to include the latest and most secure versions of dependencies.

13. **Access Control to External Resources -** if your Lambda function communicates with external resources or services, ensure that these connections are secure and limited to required operations.

14. **Serverless Application Model (SAM) and Infrastructure as Code (IaC) -** consider using tools like AWS SAM or Terraform to manage infrastructure as code. This allows for auditing, version control, and automated deployment, helping to maintain a consistent and secure environment.

15. **Applying the Zero Trust Principle -** treat each component as potentially untrustworthy. Secure communication between components (e.g., Lambda, API Gateway, DynamoDB) and restrict access based on least privilege rules.

While AWS manages the underlying infrastructure, customers are responsible for securing their code and data. There are common misconceptions regarding security in serverless architectures, and it is crucial to understand the various facets of security related to Lambda services.

## Summary

In summary, AWS Lambda provides multi-layered protection that enables secure execution of serverless applications at scale. Securing Lambda functions involves precise access management and isolation of execution environments. Proper configuration of resource policies and IAM roles allows Lambda functions to operate in line with security best practices, protecting your cloud infrastructure, data, and applications from potential threats. Additionally, support for custom runtime environments through layers, along with careful management of memory and vCPU allocation, helps maintain a high level of security and performance for Lambda functions. As a developer, remember to adhere to the precautions discussed above when creating new code for your serverless applications.

### **Additional Resources:**

* [IAM Policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html)

* [AssumeRoleWithSAML API](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_control-access_assumerole.html)

* [AWS IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/iam-ug.pdf)

* [AWS KMS Developer Guide ](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html)

* [Monitoring Secrets Manager API Calls with AWS CloudTrail ](https://docs.aws.amazon.com/secretsmanager/latest/userguide/monitoring-cloudtrail.html)
