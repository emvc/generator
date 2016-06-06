[emvc](https://emvc.github.io/emvc) application generator.

## Installation

```sh
$ npm install -g emvc-generator
```

## Quick Start

The quickest way to get started with express is to utilize the executable `emvc(1)` to generate an application as shown below:

Create the app:

```bash
$ emvc /tmp/foo && cd /tmp/foo
```

Install dependencies:

```bash
$ npm install
```

Rock and Roll

```bash
$ npm start
```

## Command Line Options

This generator can also be further configured with the following command line flags.

    -h, --help          output usage information
    -V, --version       output the version number
    -e, --ejs           add ejs engine support (defaults to jade)
    -c, --css <engine>  add stylesheet <engine> support (less|stylus|compass|sass) (defaults to plain css)
        --git           add .gitignore
    -f, --force         force on non-empty directory

## License

[MIT](LICENSE)