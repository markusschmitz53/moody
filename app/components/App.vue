<template lang="html">
    <BottomNavigation>
        <TabStrip>
            <TabStripItem class="navigation__item">
                <Image src.decode="font://&#xf274;" class="far"></Image>
            </TabStripItem>
            <TabStripItem class="navigation__item">
                <Image src.decode="font://&#xf550;" class="fas"></Image>
            </TabStripItem>
            <TabStripItem class="navigation__item">
                <Image src.decode="font://&#xf21e;" class="fas"></Image>
            </TabStripItem>
            <!--
            <TabStripItem class="n avigation__item">
                <Image src.decode="font://&#xf086;" class="far t-36"></Image>
            </TabStripItem>
            -->
        </TabStrip>

        <TabContentItem>
            <Frame id="main">
                <DailyAssessment />
            </Frame>
        </TabContentItem>

        <TabContentItem>
            <Frame>
                <Home />
            </Frame>
        </TabContentItem>

        <TabContentItem>
            <Frame>
                <Activity />
            </Frame>
        </TabContentItem>

<!--
        <TabContentItem>
            <Frame>
                <Question />
            </Frame>
        </TabContentItem>
-->
    </BottomNavigation>
</template>

<script>
import Home from "./Home.vue";
import Activity from "./Activity.vue";
import FunctionalImpairment from "./FunctionalImpairment.vue";
import DailyAssessment from "./DailyAssessment.vue";
import Question from "./Question.vue";

export default {
  components: {
    Home,
    Activity,
    DailyAssessment,
    FunctionalImpairment,
    Question
  }
};
</script>

<style lang="scss">
// Start custom common variables
@import "~@nativescript/theme/scss/variables/blue";
// End custom common variables

// Custom styles

</style>
