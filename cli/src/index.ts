import parser from "./parser";

const [, , inputFile] = process.argv;
parser()
  .then((parser) => parser.parseFile(inputFile))
  .then((entries) => entries.forEach((entry) => console.log(entry)))
  .catch((error) => console.error(error));
