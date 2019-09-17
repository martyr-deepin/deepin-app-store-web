all: build

build:
	rm node_modules || true
	ln -s vendor-deps/node_modules node_modules
	PATH=./node_modules/.bin:${PATH} npm run build

install:
	mkdir -pv ${DESTDIR}${PREFIX}/share/deepin-app-store/web_dist
	cp -r dist/deepin-app-store-web/* \
		  ${DESTDIR}${PREFIX}/share/deepin-app-store/web_dist