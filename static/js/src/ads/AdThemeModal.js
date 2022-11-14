import { AdThemeCardList } from './AdThemeCardList.js';

let AdThemeModal = Vue.extend({
    data() {
        return {
            highlightedTheme: null,
            themeCustomFields: {}
        }
    },
    props: {
        themeProps: Object,
        store: Object
    },
    components: {
        'theme-selector': AdThemeCardList
    },
    mounted() {
        this.$root.$on('bv::modal::show', this.refreshHighlightedTheme);
    },
    methods: {
        refreshHighlightedTheme() {
            this.highlightedTheme = this.store.ad.theme.parent_theme;
            this.themeCustomFields = {};
        },
        highlightTheme(theme, customFields) {
            this.highlightedTheme = theme;
            this.themeCustomFields = customFields;
        },
        select(bvModalEvt) {
            bvModalEvt.preventDefault();
            this.store.updateParentTheme(this.highlightedTheme);
            this.store.updateCustomFields(this.themeCustomFields);
            this.$bvModal.hide('modal-themes');
        },

        cancel() {
            this.$bvModal.hide('modal-themes');
        },
    },
    template: `
        <b-modal
        id="modal-themes"
        size="xl"
        scrollable
        title="Select a Theme">
            <theme-selector v-bind="themeProps" :highlightTheme="highlightTheme" :highlightedTheme="highlightedTheme" />
            <template #modal-footer>
                <div class="w-100">
                    <div v-if="highlightedTheme" class="align-items-center d-flex justify-content-between m-2">
                        <div class="align-items-center d-flex w-75">
                            <img class="float-left content__product-image w-15 mr-2" v-bind:src="highlightedTheme.thumbnail_url">
                            <p class="float-left">
                                Theme: {{highlightedTheme.name}}
                            </p>
                        </div>
                        <div class="w-25">
                            <b-button variant="primary" class="float-right m-1"
                            @click=select>
                                Select
                            </b-button>
                            <b-button variant="secondary" class="float-right m-1"
                            @click=cancel>
                                Cancel
                            </b-button>
                        </div>
                    </div>
                    <div v-else class="justify-content-end">
                        <b-button variant="secondary" class="float-right m-1"
                        @click="$bvModal.hide('modal-themes')"
                        >
                            Cancel
                        </b-button>
                    </div>
                </div>
            </template>
        </b-modal>
`
});

export {AdThemeModal};
