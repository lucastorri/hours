# hours

Format transformers for canonical `.hours` files owned by the [Todo CLI](https://github.com/lucastorri/todo).

This repository deliberately has no hours parser or editor grammar. `todo hours` owns validation, vault resolution, creation, appending, raw reads, and the versioned JSON contract. This CLI only converts that JSON to output formats.

## Requirements

- Node.js 24 or newer
- `todo` on `PATH`

Install dependencies for development with `npm install`. The CLI runs TypeScript directly; there is no build step.

## Usage

Transform a file from the configured Todo vault:

```sh
hours export report --vault 'Work/Client'
hours export softwaretechnik --vault 'Work/Client' --interval 2026-11
```

Transform an arbitrary file outside the vault:

```sh
hours export simple --input ./project.hours
```

For an external file, `hours` reads the bytes and pipes them to `todo hours parse`. For a vault reference, it calls `todo hours show <reference> --json`. The host file path is never passed to Todo.

Supported format names:

- `report` (`stats` alias): totals grouped by month, ISO week, and day
- `softwaretechnik` (`st-yaml` alias): one Softwaretechnik YAML record per day
- `simple`: canonical entry lines only

`--interval YYYY-MM` limits any format to one month. `--input` defaults to `project.hours` when `--vault` is absent.

Set `TODO_BIN` to an alternate Todo executable when testing or when it is not on `PATH`.

## Development

```sh
npm test
npm run typecheck
```
