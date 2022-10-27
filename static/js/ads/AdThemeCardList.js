import { AdThemeCard } from "./AdThemeCard.js";
import { ThemesService, AdsService } from "../common/api.service.js"

let AdThemeCardList = Vue.extend({
    components: {
        "theme-card": AdThemeCard,
    },
    data: function () {
        return ({
            themes: [],
            ads: [],
            adsDict: {},
            ad: "",
            hover: false,
        })
    },
    methods: {
        getAds() {
            let adsService = AdsService.init(this.website);
            adsService.query({
                expand: "theme,itemset,theme__parent_theme,theme__parent_theme__templates",
                only: 'id,name,theme__id,theme__parent_theme,itemset__name,theme__custom_fields'
            }, this.isVideo ? 'video' : null)
            .then(response => {
                this.ads = response.results
                this.adsDict = this.ads
            });
        },

        getThemes() {
            ThemesService.query({
                parent_theme: true,
                get_type: this.isVideo ? 'video' : 'html',
                latest_version_only: true,
                expand: 'templates'
            })
            .then(response => {
                this.themes = response.results
            })
        },
        getThemeAndCustomFieldsFromEvent(type, obj) {
            let theme = null;
            let customFields = {};
            if (type === 'ad') {
                // If it's an ad, we want to choose that ad's (child) theme's parent theme
                theme = Object.assign({}, obj.theme.parent_theme);
                // We also want to copy the custom fields from the child theme
                Object.assign(customFields, obj.theme.custom_fields);
            }
            else {
                // Otherwise we're expecting a theme from the list of top-level themes
                theme = obj;
                for (const [key, value] of Object.entries(obj.custom_fields)) {
                    if (new Set(['body_font', 'heading_font']).has(key)) {
                        customFields[key] = value
                    }
                }
            }
            return [theme, customFields];
        },
        onClickedItem(type, obj) {
            this.highlightTheme(...this.getThemeAndCustomFieldsFromEvent(type, obj));
        }
    },
    mounted: function () {
        this.getThemes();
        this.getAds();
    },
    activated: function () {
        this.getThemes();
        this.getAds();
    },
    props: {
        isVideo: Boolean,
        website: String,
        preset_image_thumbnail: String,
        highlightedTheme: Object,
        store: Object,
        highlightTheme: Function
    },
    template:
        `
    <div>
        <ul class="nav nav-pills ml-2 mb-2" id="myTab" role="tablist">
          <li class="nav-item">
            <a class="nav-link active" id="theme-tab" data-toggle="tab" href="#theme" role="tab" aria-controls="theme" aria-selected="true">Theme Library</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="copy-tab" data-toggle="tab" href="#copy" role="tab" aria-controls="copy" aria-selected="false">Copy From Ad</a>
          </li>
        </ul>

        <div class="tab-content" id="myTabContent">
          <div class="tab-pane fade show active" id="theme" role="tabpanel" aria-labelledby="theme-tab">
                <div class="row ml-2">
                    <component
                    :is="'theme-card'"
                    v-for="theme in themes"
                    :theme="theme"
                    :key="theme.id"
                    :preset_image_thumbnail="preset_image_thumbnail"
                    :currentSelection="highlightedTheme ? highlightedTheme.id : null"
                    v-on:update="onClickedItem"
                    />
                </div>
            </div>

           <div class="tab-pane fade" id="copy" role="tabpanel" aria-labelledby="copy-tab">
                <div v-if="Object.keys(adsDict).length !== 0">
                    <table class="table table-striped">
                      <thead>
                        <tr>
                          <th>Ad</th>
                          <th>Set</th>
                          <th>Theme</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(ad,i) in adsDict" :key="i" :style="{ cursor: 'pointer'}" @click="onClickedItem('ad', ad)">
                           <td>{{ ad.name }}</td>
                           <td>{{ ad.itemset.name }}</td>
                           <td>{{ ad.theme.parent_theme.name }}</td>
                        </tr>
                       </tbody>
                    </table>
                </div>
                <div v-else>
                    <br>
                   <h2>No Ads available</h2>
                </div>


                </div>
            </div>
           </div>
        </div>
    `,
});

export {AdThemeCardList}
