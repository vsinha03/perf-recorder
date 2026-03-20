import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../lib/support/world';

Given('I open the {string}', async function (this: CustomWorld, url: string) {
    this.targetUrl =url;
});

When('I wait for the page to fully load', async function (this: CustomWorld) {
    if (!this.page) {
        throw new Error('Page not initialized in Before hook');
    }

    await this.page.waitForLoadState('load');
});

Then('performance metrics are captured', function () {
    // Intentionally empty
    // Metrics are captured in After hook
});