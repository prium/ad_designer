import {ItemSetService} from '../common/api.service.js'
import {AdItemsetCard} from '../ads/AdItemsetCard.js'

let AdItemsetList = Vue.extend({
    props: {
        selectedCategory: String,
        website: String,
        preset_image_thumbnail: String,
        currentSelection: String
    },
    data: function () {
        return ({
            categoriesDict: {},
            selectedCategory_: this.selectedCategory || "",
            categories: [],
        })
    },
    components: {
        'ad-itemset-card': AdItemsetCard
    },
    methods: {
        validateForm() {
            let validated = true;
            let errors = [];
            this.$emit('updateErrors', errors);
            if (validated) {
                this.updateDetails()
            }
        },
        updateDetails(itemset) {
            this.$emit('selectTempItemset', itemset);
        },
        getCategories() {
            let itemsetService = ItemSetService.init(this.website);
            itemsetService.query()
            .then(response => {
                this.categories = response.results;
                this.categoriesDict = this.categories.reduce((a, x) => ({...a, [x.id]: x.name}), {})
            });
        },
    },
    mounted: function () {
        this.getCategories();

    },

    template:
        `
        <div class="row mx-auto">
            <component
            :is="'ad-itemset-card'"
            v-for="itemset in categories"
            :itemset="itemset"
            :key="itemset.id"
            :preset_image_thumbnail="preset_image_thumbnail"
            :currentSelection="currentSelection"
            v-on:update="updateDetails"
            />
        </div>

    `,
})

export {AdItemsetList}