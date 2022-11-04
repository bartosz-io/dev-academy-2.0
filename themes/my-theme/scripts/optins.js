function formKit(uid, show) {
    var image = show ? `<img class="optin-img" src="/img/optins/web-security-checklist.jpg" alt="Web Security Checlist" loading="lazy">` : '';
    return `<div class="optin">
                <div class="optin-wrapper">
                   ${image}
                    <div class="optin-content ck-visible">
                        <form action="https://app.convertkit.com/forms/1921330/subscriptions" class="seva-form formkit-form" method="post"
                              data-sv-form="1921330" data-uid="${uid}" data-format="modal" data-version="5"
                              data-options="{&quot;settings&quot;:{&quot;after_subscribe&quot;:{&quot;action&quot;:&quot;redirect&quot;,&quot;success_message&quot;:&quot;Success! Now CHECK your email to CONFIRM your subscription.&quot;,&quot;redirect_url&quot;:&quot;https://dev-academy.com/thank-you/&quot;},&quot;analytics&quot;:{&quot;google&quot;:null,&quot;facebook&quot;:null,&quot;segment&quot;:null,&quot;pinterest&quot;:null,&quot;sparkloop&quot;:null,&quot;googletagmanager&quot;:null},&quot;modal&quot;:{&quot;trigger&quot;:&quot;timer&quot;,&quot;scroll_percentage&quot;:&quot;70&quot;,&quot;timer&quot;:&quot;180&quot;,&quot;devices&quot;:&quot;all&quot;,&quot;show_once_every&quot;:&quot;1&quot;},&quot;powered_by&quot;:{&quot;show&quot;:false,&quot;url&quot;:&quot;https://convertkit.com?utm_campaign=poweredby&amp;utm_content=form&amp;utm_medium=referral&amp;utm_source=dynamic&quot;},&quot;recaptcha&quot;:{&quot;enabled&quot;:false},&quot;return_visitor&quot;:{&quot;action&quot;:&quot;show&quot;,&quot;custom_content&quot;:&quot;&quot;},&quot;slide_in&quot;:{&quot;display_in&quot;:&quot;bottom_right&quot;,&quot;trigger&quot;:&quot;timer&quot;,&quot;scroll_percentage&quot;:null,&quot;timer&quot;:5,&quot;devices&quot;:&quot;all&quot;,&quot;show_once_every&quot;:15},&quot;sticky_bar&quot;:{&quot;display_in&quot;:&quot;top&quot;,&quot;trigger&quot;:&quot;timer&quot;,&quot;scroll_percentage&quot;:null,&quot;timer&quot;:5,&quot;devices&quot;:&quot;all&quot;,&quot;show_once_every&quot;:15}},&quot;version&quot;:&quot;5&quot;}">
                            <div data-style="card">
                                <div data-element="column" class="formkit-column formkit-column-header">
                                    <div class="formkit-background"></div>
                                    <div class="formkit-header" data-element="header">
                                        <h2>Subscribe to Dev <strong>Academy</strong></h2>
                                    </div>
                                </div>
                                <div data-element="column" class="formkit-column formkit-column-body">
                                    <div class="formkit-subheader" data-element="subheader">
                                        <p>Join <strong>over 6000 subscribers </strong>that receive latest knowledge and tips!</p>
                                    </div>
                                    <ul class="formkit-alert formkit-alert-error" data-element="errors" data-group="alert"></ul>
                                    <div data-element="fields" class="seva-fields formkit-fields">
                                        <div class="formkit-field">
                                            <input class="formkit-input" aria-label="First Name" name="fields[first_name]" required="" placeholder="Your name" type="text">
                                        </div>
                                        <div class="formkit-field">
                                            <input class="formkit-input" name="email_address" aria-label="Your email address" placeholder="Your e-mail address" required="" type="email">
                                        </div>
                                        <button data-element="submit" class="formkit-submit formkit-submit button button-primary button-large button-block">
                                            <span>Subscribe 💪🏻</span>
                                        </button>
                                    </div>
                                    <div class="formkit-guarantee" data-element="guarantee"><p>By submitting this form you agree to receive emails with news, promotions and products and you accept Privacy Policy.</p></div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>`;
}


hexo.extend.tag.register('ws_checklist', function () {
    return `<div class="ws-optin">${formKit('test-id-1234', true)}</div>`;
});

hexo.extend.tag.register('short_mailing', function () {
    return `<div class="short-mail-wrapper">
                <h2 class="border border-light border-large">Short mailing</h2>
                <div class="short-mail">
                    <svg class="short-mail-blub" width="235" height="339" viewBox="0 0 235 339" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M39.652 0.722414C95.2488 -2.42599 142.994 34.7927 178.604 77.6513C215.347 121.874 244.116 176.31 232.315 232.605C220.311 289.873 174.334 333.94 120.236 356.1C69.9559 376.696 15.491 364.119 -34.0027 341.696C-85.4769 318.376 -142.12 288.09 -152.572 232.505C-162.777 178.237 -116.128 134.833 -80.8929 92.3464C-46.9871 51.4631 -13.3425 3.72345 39.652 0.722414Z" fill="#EFF0F7"/>
                    </svg>
                    <div class="short-mail-content">
                        <ul class="list">
                            <li>Knowledge pill 💊 It takes - 60 seconds to learn something new, like taking a pill!</li>
                            <li>Every monday you will get a knowledge pill to read with your coffee</li>
                            <li>Learn about the most important Web security principle that dictates how browsers run the websites</li>
                        </ul>
                        <div class="short-mail-optin">${formKit('test2-id-1234', false)}</div>
                    </div>
                    <img class="short-mail-img" src="/img/optins/newsletter-join.png" alt="Dev Academy Newsletter" loading="lazy">
                </div>
            </div>`;
});