<template>
	<Page @shownModally="onShownModally">
		<StackLayout orientation="vertical" class="p-20" width="100%">
			<Label class="h3" text="Stimmung (absolut)"></Label>
			<Label textWrap="true" class="p m-t-15">Wie hast du dich an diesem Tag gefühlt?</Label>
			<Label textWrap="true" class="p m-t-20">Auf der absoluten Skala ist 0 das schlimmste, was du je erlebt hast und 100 das beste.</Label>
		</StackLayout>
	</Page>
</template>
<script>

    export default {
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
