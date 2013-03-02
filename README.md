# CustomElements Polyfill

See the [specification](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/custom/index.html).

## Usage

TODO

## Use npm To Acquire Test and Minify Tools

The minifier and test tools require some dependencies not included directly in the repository. `npm` can install these for you automatically. From CustomElements folder, Invoke

> `npm install`

And `npm` will install the dependencies for you locally.

### Running Tests

After installing the test runner dependencies, load `test/index.html` in a browser.

### Using Grunt To Minify CustomElements Source

You need `grunt-cli` to run the grunt task from the command line.

> `npm install -g grunt-cli`

After installing the dependencies and `grunt-cli`, the build task should be available:

> `grunt`

Note

`node_modules` and minfied files are .gitignored.