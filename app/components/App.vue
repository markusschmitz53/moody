<template lang="html">
    <BottomNavigation>
        <TabStrip>
            <TabStripItem class="navigation__item">
                <Image src.decode="font://&#xf274;" class="far"></Image>
            </TabStripItem>
            <TabStripItem class="navigation__item">
                <Image src.decode="font://&#xf080;" class="far"></Image>
            </TabStripItem>
            <TabStripItem class="navigation__item">
                <Image src.decode="font://&#xf086;" class="far"></Image>
            </TabStripItem>
            <!--
            <TabStripItem class="navigation__item">
                <Image src.decode="font://&#xf21e;" class="fas"></Image>
            </TabStripItem>
            -->
        </TabStrip>

        <TabContentItem>
            <Frame id="main" class="m-b-10">
                <DailyAssessment />
            </Frame>
        </TabContentItem>

        <TabContentItem>
            <Frame class="m-b-10">
                <Charts />
            </Frame>
        </TabContentItem>

        <TabContentItem>
            <Frame class="m-b-10">
                <Home />
            </Frame>
        </TabContentItem>

        <TabContentItem>
            <Frame class="m-b-10">
                <Activity />
            </Frame>
        </TabContentItem>
    </BottomNavigation>
</template>

<script>
import Home from "./Home.vue";
import Activity from "./Activity.vue";
import Charts from "./Charts.vue";
import FunctionalImpairment from "./FunctionalImpairment.vue";
import DailyAssessment from "./DailyAssessment.vue";

export default {
  components: {
    Home,
    Activity,
    Charts,
    DailyAssessment,
    FunctionalImpairment
  }
};
</script>

<style lang="scss">
// Start custom common variables
@import "~@nativescript/theme/scss/variables/blue";
// End custom common variables

// Custom styles
TabStrip {
    background-color: #FFF;
    border-color: #FAFAFA;
    border-top-width: 2;
}

TabStripItem:active Image {
    color: #006968;
}

TabStripItem Image {
    color: #CCC;
}
</style>
