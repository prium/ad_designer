let AdThemeCard = Vue.extend({
    props: {
        theme: Object,
        preset_image_thumbnail: String,
        currentSelection: String
    },
    computed: {
        activeClass: function() {
            return this.currentSelection === this.theme.id ? "active-selection" : ""
        }
    },
    template:
        `
    <div class="m-2">
        <div class="content__theme" :class="activeClass" v-on:click="$emit('update', 'theme', theme)">
            <img class="content__product-image" v-bind:src="theme.thumbnail_url ? theme.thumbnail_url : preset_image_thumbnail">
            <div class="card-titleonly"> {{ theme.name }} </div>
        </div>
    </div>
    `,
});

export {AdThemeCard}
