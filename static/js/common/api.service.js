const ApiService = {
    api_url: "",
    init(api_url, token = "") {
        this.api_url = api_url;
        this.token = token;
        Vue.axios.defaults.headers.common['Authorization'] = "Token " + this.token
    },

    query(resource, params) {
        return this.doRequest(
            'get',
            `${this.api_url + resource}/`,
            params
        );
    },

    query2(resource, params) {
        return this.doRequest(
            'get',
            `${this.api_url + resource}`,
            params
        );
    },

    get(resource, slug = "", params={}) {
        return this.doRequest(
            'get',
            `${this.api_url + resource}/${slug}`,
            params
        );
    },

    post(resource, params) {
        return Vue.axios.post(`${this.api_url + resource + '/'}`, params)
    },

    update(resource, slug, params) {
        return Vue.axios.patch(`${this.api_url + resource}/${slug}`, params);
    },

    put(resource, params) {
        return Vue.axios.put(`${this.api_url + resource}`, params);
    },
    delete(resource, slug = "") {
        return Vue.axios.delete(`${this.api_url + resource}/${slug}`).catch(error => {
            throw new Error(`[loknow] ApiService ${error}`);
        });
    },

    doRequest(action, url, params) {
        return new Promise((resolve, reject) => {
            Vue.axios[action](url, {params: params})
                .then(response => resolve(this.buildResult(response)))
                .catch(error => { reject(`[loknow] ApiService ${error}`) })
        });
    },

    buildResult(response) {
        const result = response.data
        result.count = result.count ? result.count : 0;
        result.next = result.next ? result.next : null;
        result.prev = result.previous ? result.previous : null;
        return result;
    }
};

export default ApiService;

export const ThemesService = {
    get_resource(type) {
        if (type === 'video') {
            return 'videothemes'
        }
        return 'themes'
    },

    query(params) {
        return ApiService.query("themes", params);
    },
    get(id, params, type) {
        return ApiService.get(this.get_resource(type), id, params);
    },
    create(params, type) {
        return ApiService.post(this.get_resource(type), params);
    },
    update(id, params, type) {
        return ApiService.update(this.get_resource(type), id, params);
    },
    destroy(id, type) {
        return ApiService.delete(this.get_resource(type) + `/${id}`);
    },
    getLatestVersion(themeId, type) {
        return this.query({
            theme_id: themeId,
            ordering: '-version',
            type: type,
            expand: 'templates',
            page_size: 1
        })
    }
};



export const AdsService = {
    init(website) {
        this.get_resource = (type) => {
            let path = [website, 'displayads'];
            if (type) {
                path.push(type);
            }
            return path.join('/');
        };
        return this;
    },
    query(params, type) {
        return ApiService.query(this.get_resource(type), params);
    },
    get(id, params, type) {
        return ApiService.get(this.get_resource(type), id, params);
    },
    create(params, type) {
        return ApiService.post(this.get_resource(type), params);
    },
    update(id, params, type) {
        return ApiService.update(this.get_resource(type), id, params);
    },
    destroy(id, type) {
        return ApiService.delete(this.get_resource(type) + `/${id}`);
    }
};


export const ItemSetService = {
    init(website) {
        this.get_path = () => {
            let path = [website, 'itemsets'];
            return path.join('/');
        };
        return this;
    },
    query(params) {
        return ApiService.query(this.get_path(), params);
    },
    get(id, params) {
        return ApiService.get(this.get_path(), id, params);
    },
    create(params) {
        return ApiService.post(this.get_path(), params);
    },
    update(id, params) {
        return ApiService.update(this.get_path(), id, params);
    },
    destroy(id) {
        return ApiService.delete(this.get_path(), `/${id}`);
    }
};