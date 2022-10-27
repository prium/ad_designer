import ApiService, {AdsService, ThemesService} from './common/api.service.js'

Vue.use(VueFormulate);

let AdHtmlThemeBuilder = Vue.extend({
    data: function () {
        return {
            isSaving: false,
            advanced: false,
            expand: false,
            template_id: undefined,
            sizes: {},
            previewURL: '',
            secondPreviewURL: '',
            urlReady: false,
            _width: null,
            timeout: 3000,
            showingFirstIframe: false,
        }
    },

    props: {
        store: Object,
        template_preset_url: String,
        base_preset_preview_url: String,
        file_upload_url: String,
        website_id: String,
        website: String,
        ad_id: String,
        fonts: Array,
        custom_fonts: Array,
        theme_id: String,
        preset_logo_url: String,
        media_prefix: String,
    },

    mounted: function () {
        this.getSizes();
        this.showingFirstIframe = true;
        this.previewURL = this.presetPreviewURL;
        this.urlReady = true
    },

    methods: {
        getSizes() {
            let parent_theme = this.store.ad.theme.parent_theme;
            if (parent_theme.version !== parent_theme.latest_version){
                ThemesService.getLatestVersion(parent_theme.theme_id, this.isVideo ? 'video' : 'html')
                .then(response => {
                    parent_theme = response.results[0]
                })
            }

            // clear current template id & sizes if any
            this.template_id != undefined ? this.template_id = undefined : null;
            this.sizes != {} ? this.sizes = {} : null

            for (let i = 0; i < parent_theme.templates.length; i++) {
                this.sizes[parent_theme.templates[i].id] = parent_theme.templates[i].size
                // if we find 300x250 in the sizes set it as default else we use whatever is first
                // in the original list
                if (parent_theme.templates[i].size === "300 X 250") {
                    this.template_id = parent_theme.templates[i].id
                }
            }
            // sort lexographically. From entries creates a dictionary from a list
            // this is to get to to the correct format we expect
            this.sizes = Object.fromEntries(
                // object.entries converts the dictionary to a list
                Object.entries(this.sizes).sort((function (a, b) {
                    // this compares the 2 values in a list and
                    // sorts it lowest to highest in alphabetical order
                    return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0
                }))
            );
        },

        refreshItems() {
            // little cheeky way of refreshing the preview url so it reloads the iframe
            this.store.refreshItemsetImage();
        },

        showAdvanced() {
            this.advanced = true;
        },

        hideAdvanced() {
            this.advanced = false;
        },

        handleExpand() {
            this.expand = !this.expand
        },

        async uploadFile(file, progress, error, options) {
            let formData = new FormData();
            let logo_url = this.website.concat('/', file.name);
            formData.append('file', file);
            formData.append('path', logo_url);
            formData.append('add_unique_id', true);
            axios.post(this.file_upload_url,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': 'Token ' + ApiService.token
                    }
                },
                progress(100)
            ).then(response => {
                this.store.ad.theme.custom_fields.logo_url = response.data.path;
                console.log('Uploaded file with path:', response.data.path);
            }).catch(response => {
                console.log(response)
            })
        },

    },

    watch: {
        'store.ad.theme.parent_theme': function(newVal, oldVal) {
            this.getSizes();
        },
        presetPreviewURL: _.debounce(function(newVal, oldVal) {
            this.previewURL = newVal;
        }, 1000),
        width: _.debounce(function (newWidth, oldWidth) {
            this.width = newWidth
        }, 500),
    },

    computed: {
        presetPreviewURL: function() {
		    return this.template_id ? this.store.createPreviewURL(this.base_preset_preview_url, this.template_id, this.theme_id) : null
        },
        width: {
            get() {
                return this.template_id ? this.sizes[this.template_id].split('X')[0].trim() : null
            },
            set(value) {
                this._width = value
            }
        }, 
        height: function () {
            return this.template_id ? this.sizes[this.template_id].split('X')[1].trim() : null
        },
        themeCol: function() {
            return this.expand ? 'col-12' : 'col-6';
        },
        expandIcon: function() {
            return this.expand ? 'fas fa-angle-double-right' : 'fas fa-angle-double-left'
        },
        all_fonts: function(){
            return this.fonts.concat(this.custom_fonts).sort()
        }
    },

    template:
        `
    <div class="container-fluid mt-3">
        <div class="row my-2">
            <h5 class="pl-3">Customize</h5>
        </div>
        <div class="row">
            <div class="col-6" style="min-width: 305px">
                <div>
                    <FormulateInput
                    type="image"
                    name="logo"
                    label="Logo"
                    help="Select a png, jpg to upload."
                    :uploader="uploadFile"
                    validation="mime:image/jpeg,image/png"
                    class="custom-file-upload mb-3"
                    />
                    <h6 class="font-weight-normal">Palette</h6>
                    <div class="row pl-3 mb-3 align-items-center">
                        <i class="fas fa-fill col pl-0 flex-grow-0 palette-icons"></i>
                        <div class='col pl-0 flex-grow-0'><FormulateInput type="color" name="primary" v-model="store.ad.theme.custom_fields.primary" error-behavior="live" help="Button"/></div>
                        <div class='col pl-0 flex-grow-0'><FormulateInput type="color" name="secondary" v-model="store.ad.theme.custom_fields.secondary" error-behavior="live" help="Primary"/></div>
                        <div class='col pl-0 flex-grow-0'><FormulateInput type="color" name="tertiary" v-model="store.ad.theme.custom_fields.tertiary" error-behavior="live" help="Secondary"/></div>
                    </div>
                    <div class="row pl-3 mb-3 align-items-center">
                        <i class="fas fa-font col pl-0 flex-grow-0 palette-icons"></i>
                        <div class='col pl-0 flex-grow-0'><FormulateInput type="color" name="primary_text" v-model="store.ad.theme.custom_fields.primary_text" error-behavior="live" help="Button"/></div>
                        <div class='col pl-0 flex-grow-0'><FormulateInput type="color" name="secondary_text" v-model="store.ad.theme.custom_fields.secondary_text" error-behavior="live" help="Primary"/></div>
                        <div class='col pl-0 flex-grow-0'><FormulateInput type="color" name="tertiary_text" v-model="store.ad.theme.custom_fields.tertiary_text" error-behavior="live" help="Secondary"/></div>
                    </div>
                    <FormulateInput
                    class="mb-3"
                    type="text" label="Headline" v-model="store.ad.theme.custom_fields.headline"
                    :wrapper-class="['mb-2']" placeholder="Enter a Headline"
                    />
                    <FormulateInput
                    class="mb-3"
                    type="text" label="Call to Action (CTA)" v-model="store.ad.theme.custom_fields.call_to_action" :input-class="['form-control']"
                    :wrapper-class="['mb-2']" placeholder="Enter a Call to Action (eg. SHOP NOW)"
                    />
                   <div v-if="advanced" class="mb-2">
                        <div class="mb-2"><span @click="hideAdvanced" class="pseudolink">Hide advanced options</span></div>
                        <h6>Text</h6>
                        <div class="row pl-3">
                            <label>Heading</label>
                        </div>
                        <div class="row pl-3 mb-3 align-items-center">
                            <select class="form-control form-control-sm w-25 mr-1" v-model="store.ad.theme.custom_fields.heading_font">
                                <option disabled value="">Please select a font</option>
                                <option v-for="font in this.all_fonts" :value="font">{{ font }}</option>
                            </select>
                        </div>
                        <div class="row pl-3">
                            <label>Body</label>
                        </div>  
                        <div class="row pl-3 mb-3 align-items-center">
                            <select class="form-control form-control-sm w-25 mr-1" v-model="store.ad.theme.custom_fields.body_font">
                                <option disabled value="">Please select a font</option>
                                <option v-for="font in this.all_fonts" :value="font">{{ font }}</option>
                            </select>
                        </div>
                    </div>
                    <div v-else class="mb-2">
                        <span class="pseudolink" @click="showAdvanced">Advanced options</span>
                    </div>
                </div>
            </div>
            <div class="position-absolute theme-preview overflow-auto pl-4" :class="themeCol">
                <div class="d-flex">
                    <i :class="expandIcon" class="pr-5 theme-preview-expand" @click="handleExpand"></i>
                    <div>
                        <div class="row align-self-center">
                            <FormulateInput
                            v-model="template_id"
                            :options="sizes"
                            type="select"
                            placeholder="Select a Template size"
                            label="Theme Preview"
                            />
                            <div class="col-auto p-0 pt-4 mt-2 pl-2">
                                <button type="button" class="btn btn-primary" @click="refreshItems()">Refresh</button>
                            </div>
                        </div>
                        <div class="row align-self-center ">
                            <iframe class="my-2"
                            v-bind:width="width"
                            v-bind:height="height"
                            v-bind:src="previewURL"
                            scrolling="no"
                            frameborder="0">
                            </iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
});

export {AdHtmlThemeBuilder};
