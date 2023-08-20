install-dev:
	npm install
	npm run dev

install-prod:
	npm install
	npm run build

publish:
	echo "Do not forgotten to change the version number in package.json"
	npm publish --access public
