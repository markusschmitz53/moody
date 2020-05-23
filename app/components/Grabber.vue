<template lang="html">
    <Page>
        <Button text="grab" @tap="onTap" class="-outline -rounded-lg "></Button>
    </Page>
</template>
<script>
    const utils = require("utils/utils").ad;
    export default {
        data   : () => {
            return {};
        },
        methods: {
            onTap() {
                this.startBackground();
            },
            startBackground() {
                const context = utils.getApplicationContext();
                const component = new android.content.ComponentName(context, de.markusschmitz.GrabberService.class);
                const builder = new android.app.job.JobInfo.Builder(1, component);
                builder.setRequiredNetworkType(android.app.job.JobInfo.NETWORK_TYPE_ANY);
                builder.setMinimumLatency(1000 * 60)
                builder.setOverrideDeadline(1000 * 100)
                builder.setPersisted(true)

                const jobScheduler = context.getSystemService(android.content.Context.JOB_SCHEDULER_SERVICE);
                const service = jobScheduler.schedule(builder.build());
                console.log(`Job Scheduled: ${jobScheduler.schedule(builder.build())}`);
            }
        }
    }
</script>

<style lang="scss" scoped>
// Start custom common variables
@import "~@nativescript/theme/scss/variables/blue";
// End custom common variables

// Custom styles
</style>
