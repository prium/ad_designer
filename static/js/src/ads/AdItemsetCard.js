let AdItemsetCard = Vue.extend({
    props: {
        itemset: Object,
        preset_image_thumbnail: String,
        currentSelection: String
    },
    computed: {
        activeClass: function() {
            return this.currentSelection === this.itemset.id ? "active-selection" : ""
        }
    },
    template: `
    <div class="m-2">
        <b-card
        v-bind:img-src="itemset.image_urls[0] ? itemset.image_urls[0] : preset_image_thumbnail"
        img-alt="Image"
        img-top
        tag="article"
        class="itemset-card cursor-pointer"
        :class="activeClass"
        v-on:click="$emit('update', {'id': itemset.id, 'name': itemset.name, 'image_url': itemset.image_urls[0]? itemset.image_urls[0] : preset_image_thumbnail})"
        >
            <div class="d-flex justify-content-between align-items-start">
                <b-card-text class="card-titleonly">
                    {{ itemset.name }}
                </b-card-text>
            </div>
        </b-card>
  </div>
    `
});

export {AdItemsetCard}