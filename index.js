#! /usr/bin/env node
const args = require("commander")
const copyPaste = require("copy-paste")
const Tesseract = require("tesseract.js")
const Progress = require("progress")
const PkgJson = require("./package.json")

//Used in help
args.usage("PATH [options]")
args.description(PkgJson.description)

//Arguments (Order determines order shown in help)
args.option("-l, --lang [language]", "Language of the text in the image.\n\t"+
	"Full language list can be found here: "+
	"https://github.com/naptha/tesseract.js/blob/master/docs/tesseract_lang_list.md")
args.version(PkgJson.version)

args.parse(process.argv)

if(!args.args.length || args.args[0] === undefined){
	console.error("  No Path Specified")
	args.help()
	return
}

if(args.lang === undefined)
	args.lang = "eng"

recognize(args.args[0], args.lang)

function recognize(imagePath, lang) {
	const bar = new Progress("recognizing [:bar] :percent :elapseds", {total: 100})
	let prev = 0
	Tesseract.recognize(imagePath, {
		lang
	})
	.progress(p => {
		const nextVal = Math.floor(p.progress * 100)
		if (nextVal && nextVal > prev) {
			bar.tick()
			prev++
		}
	})
	.catch(err => {
		console.log(err)
	})
	.then(result => {
		if (prev < 100) {
			bar.tick(100 - prev)
		}
		copyPaste.copy(result.text, () => {
			console.log("Finished copying to clipboard")
			process.exit()
		})
	})
}
