<template lang="html">
    <BottomNavigation>
        <TabStrip>
            <TabStripItem class="navigation__item">
                <Image src.decode="font://&#xf274;" class="far t-36"></Image>
            </TabStripItem>
            <TabStripItem class="navigation__item">
                <Image src.decode="font://&#xf550;" class="fas t-36"></Image>
            </TabStripItem>
            <TabStripItem class="navigation__item">
                <Image src.decode="font://&#xf21e;" class="fas t-36"></Image>
            </TabStripItem>
            <!--
            <TabStripItem class="n avigation__item">
                <Image src.decode="font://&#xf086;" class="far t-36"></Image>
            </TabStripItem>
            -->
        </TabStrip>

        <TabContentItem>
            <Frame id="main">
                <Rating />
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
import Mood from "./Mood.vue";
import Rating from "./Rating.vue";
import Question from "./Question.vue";

export default {
  components: {
    Home,
    Activity,
    Rating,
    Mood,
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
