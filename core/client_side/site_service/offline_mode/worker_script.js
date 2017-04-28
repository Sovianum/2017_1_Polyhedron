'use strict';

const CACHE_NAME = 'cache_v_1';
const INFO_URL = 'http://localhost:3000/cached_urls';  // TODO remove


self.addEventListener('install', event => {
    console.log('install', event);
});


self.addEventListener('activate', event => {
    console.log('activate', event);
});


self.addEventListener('install', event => {
    event.waitUntil(
        fetch(INFO_URL)
            .then(response => response.json())
            .then(cacheURLs => {
                caches.open(CACHE_NAME)
                    .then(cache => cache.addAll(cacheURLs));
            })
        );
});

self.addEventListener('fetch', event => {
    const lastModifiedPromise = fetch(event.request.url, {method: 'HEAD'})  // TODO maybe need to enable cors
        .then(response => response.headers.get('Last-Modified'))
        .catch(err => null);
    const cachedResponsePromise = caches.match(event.request);

    event.respondWith(
        Promise
            .all([lastModifiedPromise, cachedResponsePromise])
            .then(
                ([lastModified, cachedResponse]) => {
                    if (cachedResponse) {
                        if (!lastModified || new Date(lastModified).getTime() < Date.now()) {
                            return cachedResponse;
                        }
                    }

                    return fetch(event.request);
                }
            )
    );
});

