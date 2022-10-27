import {AdHtmlThemeBuilder} from './AdHtmlThemeBuilder.js';
import {ThemesService, AdsService, ItemSetService} from "./common/api.service.js";
import { AdThemeModal } from './ads/AdThemeModal.js';
import { AdItemsetList } from './ads/AdItemsetList.js'
import {store} from './ads/DisplayAdsDatastore.js'

Vue.use(VueFormulate);


let AdFormInit = (dataStore, adsService, type, adId, website, setLatestParentTheme, ...updateCallBacks) => {
    return adsService.init(website).get(
        adId,
        {
            expand:'itemset,theme__parent_theme__templates,theme__parent_theme__latest_version',
            only: 'name,itemset,theme__parent_theme,theme__custom_fields'
        },
        type
    ).then(response => {
        dataStore.updateAd(response)
        dataStore.setDefaultColorTheme()
        setLatestParentTheme(response.theme.parent_theme)
        dataStore.updateTempItemset(response.itemset)
        dataStore.addHexCode(dataStore.ad.theme.custom_fields)
        dataStore.readyStore()
        for (let i=0; i<updateCallBacks.length; i++) {
            updateCallBacks[i]()
        }
    })
}


let AdForm = Vue.extend({
    data: function () {
        return ({
            store: store,
            currentComponent: "theme-builder",
            errors: [],
            adId: this.ad_id,
            isVideo: new URL(document.location).searchParams.get("type") == "video" ? true : false,
            themesLoaded: false,
            itemsetsLoaded: false,
            errorMessage: false,
        });
    },
    computed: {
        componentProps: function () {
            return {
                store: this.store,
                template_preset_url: this.template_preset_url,
                base_preset_preview_url: this.base_preset_preview_url,
                file_upload_url: this.file_upload_url,
                website_id: this.website_id,
                website: this.website,
                ad_id: this.adId,
                media_prefix: this.media_prefix,
                isVideo: this.isVideo,
                preset_asset_thumbnail: this.preset_asset_thumbnail,
                fonts: this.fonts,
                custom_fonts: this.custom_fonts,
                theme_id: this.theme_id
            }
        },
        adNameError: function () {
            return this.store.ad.adNameError
        },
        isReadOnly: function () {
            return this.isVideo && this.adId !== "" ? true : false
        }
    },


    mounted: function () {
        if (Cookies.get('csrftoken')) {
            this.init()
        }
    },

    components: {
        // check if video or html ad and render appropriate component
        'theme-builder': AdHtmlThemeBuilder,
        'theme-modal': AdThemeModal,
        'itemset-selector': AdItemsetList,
    },


    methods: {
        init() {
            if (this.adId !== "") {
                let type = this.isVideo ? 'video' : 'html';
                AdFormInit(
                    this.store,
                    AdsService,
                    type,
                    this.adId,
                    this.website,
                    this.setLatestParentTheme,
                    this.loadedItemset,
                    this.loadedThemes
                )
            } else {
                this.setDefaultParentThemeAndItemSet()
            }
        },

        loadedItemset() {
            this.itemsetsLoaded = true
        },

        loadedThemes() {
            this.themesLoaded = true
        },

        setLatestParentTheme(parent_theme){
            if (parent_theme.version !== parent_theme.latest_version) {
                ThemesService.getLatestVersion(parent_theme.theme_id, this.isVideo ? 'video' : 'html')
                .then(response => {
                    parent_theme = response.results[0];
                    this.store.updateParentTheme(parent_theme);
                })
            }
        },

        setDefaultParentThemeAndItemSet() {
            let type = this.isVideo ? 'video' : 'html';

            if(this.ready === true) {
                this.ready = false
            }
            ThemesService.query({'parent_theme': true, 'expand': 'templates', 'page_size': 1, 'latest_version_only': true, 'get_type': type}).then(response => {
                let parent_theme = response.results[0]
                this.store.updateParentTheme(parent_theme)
                this.themesLoaded = true;
                for (const property in parent_theme.custom_fields) {
                    this.store.updateCustomfield(property, parent_theme.custom_fields[property])
                }
                this.store.updateCustomfield()
                let itemsetService = ItemSetService.init(this.website);
                itemsetService.query({'type': 'default,custom', 'page_size': 1})
                .then(response => {
                    if(response.results.length > 0) {
                        this.itemsetsLoaded = true;
                        this.store.updateItemset(response.results[0])
                        this.store.updateTempItemset(response.results[0])
                        this.store.updateCustomfield('logo_url', this.preset_logo_url)
                        this.store.addHexCode(this.store.ad.theme.custom_fields)
                        this.store.readyStore()
                    } else {
                        this.errorMessage = true;
                    }
                });
            })
        },

        // itemset modal functions
        selectTempItemset(itemset) {
            this.store.updateTempItemset(itemset)
            // this.store.tempItemset = itemset
        },

        handleSelectItemset(bvModalEvt) {
            // Prevent modal from closing
            bvModalEvt.preventDefault();
            this.store.updateItemset(this.store.tempItemset)
            this.$bvModal.hide('modal-itemsets');
        },

        handleItemsetCancel() {
            this.store.updateItemset(this.store.tempItemset)
            this.$bvModal.hide('modal-itemsets');
        },
    },
    props: {
        template_preset_url: String,
        base_preset_preview_url: String,
        file_upload_url: String,
        website_id: String,
        website: String,
        theme_id: String,
        ad_id: String,
        fonts: Array,
        custom_fonts: Array,
        preset_logo_url: String,
        media_prefix: String,
        preset_asset_thumbnail: String,
        preset_image_thumbnail: String,
        setsURL: String,
    },
    template:
        `
        <div>
            <div v-if="errors.length > 0">
                <ul class="list-group">
                    <li class="list-group-item list-group-item-danger" v-for="error in errors">
                        {{error.name}} - {{error.message}}
                    </li>
                </ul>
            </div>

            <div v-if="errorMessage">
                <b-alert show variant="warning">Please <a :href="setsURL">create a set</a> before creating an ad</b-alert>
            </div>

            <div class="position-relative">
                <form autocomplete="off">
                    <div class="form-row mb-4 col-6">
                        <div class="col">
                            <label :class="{requiredField: true}">Name*</label>
                            <input placeholder="Enter Ad name" class="form-control" validation="required" v-model="store.ad.name"/>
                        </div>
                    </div>
                </form>
                <p v-if="adNameError && store.ad.name===''" class="text-danger pl-3">Please enter a name for the ad</p>

                <div class="mb-4 col-6">
                    <div class="row align-items-center ml-2 mb-2">
                        <p v-if="itemsetsLoaded" class="mt-0 mb-0 mr-4"><strong>Set:</strong> {{this.store.ad.itemset.name}}</p>
                        <p v-else class="mt-0 mb-0 mr-4"><strong>Set:</strong> Loading...</p>
                        <b-button v-if="!isReadOnly" size="sm" v-b-modal.modal-itemsets>Change</b-button>

                        <b-modal
                        id="modal-itemsets"
                        scrollable
                        size="xl"
                        title="Select a Set">
                            <component
                            :is="'itemset-selector'"
                            v-on:selectTempItemset="selectTempItemset"
                            :website="website"
                            :preset_image_thumbnail="preset_image_thumbnail"
                            :currentSelection="store.tempItemset?.id"
                            />
                            <template #modal-footer>
                                <div class="w-100">
                                    <div v-if="store.tempItemset" class="align-items-center d-flex justify-content-between m-2">
                                        <div class="align-items-center d-flex w-75">
                                            <img class="float-left content__product-image w-15 mr-2" v-bind:src="store.tempItemset.image_url || store.tempItemset.image_urls[0]">
                                            <p class="float-left">
                                                Set: {{store.tempItemset.name}}
                                            </p>
                                        </div>
                                        <div class="w-25">
                                            <b-button variant="primary" class="float-right m-1"
                                            @click=handleSelectItemset>
                                                Select
                                            </b-button>
                                            <b-button variant="secondary" class="float-right m-1"
                                            @click=handleItemsetCancel>
                                                Cancel
                                            </b-button>
                                        </div>
                                    </div>
                                <div v-else class="justify-content-end">
                                    <b-button variant="secondary" class="float-right m-1"
                                    @click="$bvModal.hide('modal-itemsets')"
                                    >
                                        Cancel
                                    </b-button>
                                </div>
                            </div>
                            </template>
                        </b-modal>
                    </div>

                    <div class="row align-items-center ml-2 mb-2">
                        <p v-if="itemsetsLoaded" class="mt-0 mb-0 mr-4"><strong>Theme:</strong> {{this.store.ad.theme.parent_theme.name}}</p>
                        <p v-else class="mt-0 mb-0 mr-4"><strong>Theme:</strong> Loading...</p>
                        <b-button v-if="!isReadOnly" size="sm" v-b-modal.modal-themes>Change</b-button>
                        <theme-modal
                            :themeProps='{"isVideo": isVideo, "website": website, "preset_image_thumbnail": preset_image_thumbnail}'
                            :store="store"
                        ></theme-modal>
                    </div>
                </div>

                <component
                    :is="currentComponent"
                    v-if="store.ready"
                    v-bind="{...componentProps}">
                </component>
            </div>
        </div>
    `,
});

export {AdForm, AdFormInit};
