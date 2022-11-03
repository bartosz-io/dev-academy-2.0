function formKit(uid) {
    return `<div class="optin optin-checklist">
                <div class="optin-wrapper">
                    <img class="optin-img" src="/img/web-security-checklist.jpg" alt="Web Security Checlist" loading="lazy">
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
    return formKit('test-id-1234');
});