<template>
	<Page @shownModally="onShownModally">
		<StackLayout orientation="vertical" class="p-20" width="100%">
			<Label class="h3" text="Komorbide Symptome"></Label>
			<Label textWrap="true" class="p m-t-15">Von Komorbidität spricht man, wenn eine Begleiterkrankung vorhanden ist oder gleichzeitig mehrere Erkrankungen auftreten.</Label>
			<Label textWrap="true" class="p m-t-20">Einige Beispiele sind Alkoholmissbrauch, Drogenmissbrauch, Essstörungen, Angsterkrankungen und Zwangsstörungen.</Label>
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
