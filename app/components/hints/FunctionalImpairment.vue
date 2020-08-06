<template>
	<Page @shownModally="onShownModally">
		<StackLayout orientation="vertical" class="p-20" width="100%">
			<Label class="h3" text="Funktionale Einschränkung"></Label>
			<Label textWrap="true" class="p m-t-15">Wie sehr hast du dich im Alltag eingeschränkt gefühlt?</Label>
			<Label textWrap="true" class="p m-t-20">Du kannst mehrere Einschätzungen für jeden Tag hinzufügen.</Label>
		</StackLayout>
	</Page>
</template>
<script>

    export default {
    	props: ["currentValue"],
		data: () => {
			return {
			}
		},
		methods: {
			onShownModally() {

			}
		}
	}
</script>
<style scoped lang="scss">
	// Start custom common variables
	@import "~@nativescript/theme/scss/variables/blue";
	// End custom common variables
</style>
