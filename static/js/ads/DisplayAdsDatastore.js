const store = {
    ad: {
        theme: {
            custom_fields: {
                // note that color values are without # as same when getting from retriever api,
                // but when init ad with api, you should call addHexCode to add #
                // and when you save with api, you should call removeHexCode by passing copy of this field
                slogan: "",
                primary: "00B0B8",
                primary_text: "FFFFFF",
                headline: "You don't want to miss out!",
                logo_url: "",
                tertiary: "FFFFFF",
                tertiary_text: "171718",
                body_font: "",
                secondary: "F9F7EC",
                secondary_text: "272727",
                image_index: 0,
                heading_font: "",
                call_to_action: "SHOP NOW"
            },
            parent_theme: null
        },
        itemset: null,
        name: "",
        adNameError: false,
    },
    tempItemset: undefined,
    ready: false,

    addHexCode(custom_fields) {
        custom_fields.primary = "#".concat(custom_fields.primary);
        custom_fields.tertiary = "#".concat(custom_fields.tertiary);
        custom_fields.secondary = "#".concat(custom_fields.secondary);
        custom_fields.primary_text = "#".concat(custom_fields.primary_text);
        custom_fields.tertiary_text = "#".concat(custom_fields.tertiary_text);
        custom_fields.secondary_text = "#".concat(custom_fields.secondary_text);
        return custom_fields;
    },


    removeHexCode(custom_fields) {
        // note this custom fields should be a copy of this.ad.theme.custom_fields
        custom_fields.primary = custom_fields.primary.replace('#', '');
        custom_fields.tertiary = custom_fields.tertiary.replace('#', '');
        custom_fields.secondary = custom_fields.secondary.replace('#', '');
        custom_fields.primary_text = custom_fields.primary_text.replace('#', '');
        custom_fields.tertiary_text = custom_fields.tertiary_text.replace('#', '');
        custom_fields.secondary_text = custom_fields.secondary_text.replace('#', '');
        return custom_fields;
    },

    updateAd(ad) {
        Object.assign(this.ad, ad)
    },

    updateParentTheme(newTheme) {
        this.ad.theme.parent_theme = newTheme
    },

    updateCustomFields(customFields) {
        for (const [key, value] of Object.entries(customFields)) {
            this.updateCustomfield(key, this.isColorField(key) ? `#${value}` : value);
        }
    },

    updateCustomfield(key, value) {
        if (this.ad.theme.custom_fields.hasOwnProperty(key)) {
            this.ad.theme.custom_fields[key] = value
        }
    },

    clearCustomFields() {
        Object.getOwnPropertyNames(this.ad.theme.custom_fields).forEach((prop, idx) => {
            this.ad.theme.custom_fields[prop] = undefined;
        })
    },

    updateTempItemset(newItemset) {
        this.tempItemset = newItemset
    },

    updateItemset(newItemset) {
        this.ad.itemset = newItemset
    },

    readyStore() {
        this.ready = !this.ready
    },

    refreshItemsetImage() {
        if (this.ad.theme.custom_fields.image_index < this.ad.itemset.item_count) {
            this.ad.theme.custom_fields.image_index++;
        } else {
            this.ad.theme.custom_fields.image_index = 0;
        }
    },

    createPreviewURL(base_preset_preview_url, templateId, themeId) {
        var custom_query = Object.keys(this.ad.theme.custom_fields).reduce(
            (arg_list, key) =>
                // If the custom field value is undefined, format it and add it to the list of query string args
                (this.ad.theme.custom_fields[key] !== undefined)
                ? arg_list.concat(key + "=" + this.formatCustomField(key, this.ad.theme.custom_fields[key]))
                // otherwise exclude it
                : arg_list,
            [] // Initial value for the reducer
        ).join("&");
        return base_preset_preview_url.concat(
            '?template_id=', templateId,
            '&itemset_id=', this.ad.itemset.id,
            '&theme_id=', themeId,
            '&', custom_query)
    },

    formatCustomField(key, value) {
        if (this.isColorField(key) && value) {
            return value.replace('#', '')
        } else if (this.isEncodedRequiredField(key)) {
            return encodeURIComponent(value)
        }
        return value
    },

    isColorField(key) {
        const colorFields = ['primary', 'secondary', 'tertiary', 'primary_text', 'secondary_text', 'tertiary_text']
        return colorFields.includes(key)
    },

    isEncodedRequiredField(key) {
        const encodedRequiredField = ['call_to_action', 'headline', 'slogan', 'logo_url']
        return encodedRequiredField.includes(key)
    },

    changeAdNameErrorStatus(status) {
        this.ad.adNameError = status
    },

    setDefaultColorTheme() {
        // Some logic here to try to look for new custom fields in legacy locations, e.g. `body`, `heading` 
        this.ad.theme.custom_fields.primary_text == undefined ? this.ad.theme.custom_fields.primary_text = this.ad.theme.custom_fields.button : this.ad.theme.custom_fields.primary_text
        this.ad.theme.custom_fields.secondary_text == undefined ? this.ad.theme.custom_fields.secondary_text = this.ad.theme.custom_fields.heading :  this.ad.theme.custom_fields.secondary_text
        this.ad.theme.custom_fields.tertiary_text == undefined ? this.ad.theme.custom_fields.tertiary_text = this.ad.theme.custom_fields.body : this.ad.theme.custom_fields.tertiary_text
    }
};

export {
    store
};
