const natures = [
    "Hardy",
    "Lonely",
    "Brave",
    "Adamant",
    "Naughty",
    "Docile",
    "Bold",
    "Relaxed",
    "Impish",
    "Lax",
    "Serious",
    "Timid",
    "Hasty",
    "Jolly",
    "Naive",
    "Bashful",
    "Modest",
    "Mild",
    "Quiet",
    "Rash",
    "Quirky",
    "Calm",
    "Gentle",
    "Sassy",
    "Careful"
]
module.exports = class Pokemon {
    constructor(object) {
        this.xp = 1;
        this.name = object.name;
        this.price = 0;
        this.id = null;
        this.event = false;
        this.level = object.level;
        this.gender = object.gender;
        this.index = object.index;
        this.url = object.url;
        this.hp =  Math.floor(Math.random() * 31);
		this.atk =  Math.floor(Math.random() * 31);
		this.def =  Math.floor(Math.random() * 31);
		this.spatk =  Math.floor(Math.random() * 31);
		this.spdef = Math.floor(Math.random() * 31);
		this.speed =  Math.floor(Math.random() * 31);
        this.moves = [];
        this.helditem = [];
        this.shiny = object.shiny;
        this.rarity = object.rarity;
        this.nature = natures[Math.floor(Math.random() * natures.length)];
        let totaliv = ((this.hp + this.atk + this.def + this.spatk + this.spdef + this.speed) / 186) * 100;
        this.totalIV = (totaliv.toFixed(1));
    }
}