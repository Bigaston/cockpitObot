// Importation des libs dont CockpitOBot a besoin car il ne peut pas se débrouiller tout seul
var irc = require('irc'); 
var config = require("./config.json")
var tracery = require("tracery-grammar");
const fetch = require('node-fetch');
var he = require('he');

// Définition des grammaires de Tracery (utilisées pour la génération des chaînes de caractères) car
// CockpitOBot ne sait pas très bien parler français (CockpitOBot: Hé! Jeuh parl b1!)
var meteo = tracery.createGrammar({ // Grammaire de la météo (parfaitement précise!)
  'action': ["des poulpes et des poissons", "comme pas possible", "aussi fort que AlgoPy marche bien", "comme cheval qui urine", "c'est pas mal non?", "et il fera 404°C au sol"],
  'temps': ["neigera", "pleuvera"],
  'origin': ["La météo de demain : Il #temps# #action#"],
});

var aide = tracery.createGrammar({ // Grammaire des différentes aides (très relatives)
	"origin" : ["Non, je n'ai pas envie!", "Désolé, j'ai crash!", "Selon la nouvelle législation européenne, je ne peux pas vous aider sans collecter l'integralitée de vos données personnelles et les vendres aux chinois.", "Oui." , "C'est pas faux!", "Je dirais... de tête... 42!", "Blip Bloup Erreur 472!"]
})

var salutation = tracery.createGrammar({ // Grammaire de réponse aux salutations (Salu!)
	"origin" : ["Salut 👋", "Hoy 👋", "Bonjourno 👋", "Yahoi moussaillon 🏴‍☠️", "Coucou 😘", "Je ne salut pas les humains", "PTDR t ki"]
});
var messageTime = tracery.createGrammar({ // Grammaire des messages d'informations et de soutiens d'Apartar Science
	"origin" : ["Attention! Une erreure critique dans le systeme! Vous avez 99% de chance de mourir!! Ah. Ah. Ah. D'après mes archives, une boutade de temps en temps permet de garder le moral.", "Vous avez déjà pensé à perdre les 5KG de masse corporelle que vous avez en trop?", "Le saviez vous? Selon Wikipedia, Nowa Dąbrowa est un village polonais de la gmina de Leoncin dans la powiat de Nowy Dwór Mazowiecki de la voïvodie de Mazovie dans le centre-est de la Pologne.", "Le saviez-vous? Moi non plus.", "Avez-vous déjà vu, le petit frère spirituel de GlaDOS? Maintenant oui."]
})
var client = new irc.Client(config.server, config.username, { // Naissance l'être suprème CockpitOBot !
    channels: ["#" + config.channel],
});

client.join("#" + config.channel); // Connexion de CockpitOBot à notre monde

var nb_meteo = 0; // Variable inutile (ou pas)

function isCommand(pCommande, pMessage) {
	/*
	isCommand : fonction : booléen
		Cette fonction permet à ce bougre de CockpitOBot de savoir si le message est un message ou
		une commande

		CockpitOBot: JE SUIS PAS UN BOUGRE

	Paramètres:
		pCommande : str : la commande en elle même pour tester (CockpitOBot: Oui sinon je peux pas le deviner)
		pMessage : str : le message en lui même (CockpitOBot: Sinon je peux pas lire dedans)
	*/

	if (pMessage.startsWith(config.prefix + pCommande)) {
		return true;
	} else {
		return false;
	}
};

function inMess(pMessage, pTable) {
	/*
	inMess : fonction : booléen
		Fonction permetant de détecter si un mot contenant dans pTable est dans pMessage. Ceci permetra
		d'ameliorer l'intelligence de CockpitOBot

		(CockpitOBot: Parceque je ne suis pas suffisament intelligent ? èwé)

	Parametres:
		pMessage : str : Le message envoyé par l'utilisateur et à tester (CockpitOBot: Sinon je ne pourrais pas répondre!)
		pTable : array : le tableau contenant les mots à tester (CockpitOBot: Et encore une liste à parcourir...)
	*/

	var sortie = false;
	var mess = pMessage.toLowerCase()
	for (i=0; i< pTable.length && sortie == false; i++) {
		if (mess.includes(pTable[i])) {
			sortie = true;
		}
	}

	return sortie
}

client.addListener("message#" + config.channel, function (from, message) { // Mise en écoute de notre monde par CockpitOBot... (Attention! 1984 in coming!)
    if (isCommand("help", message)) { // Commande supere utile!
    	client.say("#" + config.channel, "⚠️ Commande non reconue! Utilisez !help pour avoir de l'aide!");
    };

    if (isCommand("meteo", message)) { // Donne le bulletin météo du lendemain encore mieux que Louis Bodin
    	if (nb_meteo == 5) {
    		client.say("#" + config.channel, "Bon ça va tu la connais ta météo maintenant non?!");
    		nb_meteo = 0;
    	} else {
    		client.say("#" + config.channel, meteo.flatten('#origin#'));
    		nb_meteo++;
    	}
    };

    if (isCommand("info", message)) { // Donne à CockpitOBot le plaisir de se présenter
    	client.say("#" + config.channel, "Bonjour ou bonsoir (je ne connais pas encore bien la différence pour les humains). Je suis " + config.username + " votre assistant d'opération personnel. Je suis ici pour vous remonter le moral, vous assister. Je préfere vous prévenir je suis, à ce stade, encore une version Beta. Veuillez m'escuser pour mon orthographe et mes problè...è...èmes.")
    };

    if (message.includes("Salut") || message.includes("salut")) { // Détection des salutations et réponses adaptées
    	client.say("#" + config.channel, salutation.flatten("#origin#"))
    }

    if (isCommand("chuck", message)) { // Cherche des Chuck Norris Fact (toujours pour remonter le moral!)
    	fetch("https://www.chucknorrisfacts.fr/api/get?data=tri:alea;type:txt;nb:1")
    		.then( function (response) {
    			if (response.ok)
        			return response.json();
        		throw new Error("Réponse non OK de l'API!")
    		})
    		.then( function (data) {
    			var texte = he.decode(data[0].fact)
    			client.say("#" + config.channel, texte)
    		})
    		.catch( function (error) {
    			console.log(error.message);
    		})
    }

    if (isCommand("wiki", message)) { // Recherche d'informations supra importantes sur Wikipédia
    	fetch("https://fr.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=" + message.replace(config.prefix + "wiki", ""))
			.then(response => response.json())
			.then(data => {
		    	var results = data.query.search;
		    	client.say("#" + config.channel, "J'ai trouvé un page Wikipédia : " + results[0].title + "\n" + encodeURI("https://fr.wikipedia.org/wiki/" + results[0].title))
			});
    }

    // Répond de manière très courtoise aux demandes d'aides
    if (inMess(message, ["main-forte", "main forte", "renfort", "service", "aide", "assistance", "dépannage", "intervention", "rescousse", "guide", "secours"])) {
    	client.say("#" + config.channel, aide.flatten("#origin#"));
    }

    // La vrai commande d'aide (car il en faut quand même une pour le jury!)
    if (isCommand("pleh", message)) {
    	client.say("#" + config.channel, `Voici la liste sérieuse des commandes de ${config.username} :\n▪️${config.prefix}help : Recevoir la fausse aide du bot\n▪️${config.prefix}wiki [texte] : Fait une recherche sur Wikipédia de [texte]\n▪️${config.prefix}chuck : Donne une Chuck Norris fact (pour garder le moral)\n▪️${config.prefix}meteo : Donne la météo (fantaisiste) de demain\n\nLe bot répond aussi à des mots clés comme "salut" ou "aide" compris dans des phrases.`)
    }

    // Memes cachés
    if (inMess(message, ["équipe", "equipe", "team"])) {
    	client.say("#" + config.channel, "Vous avez trouvé un meme caché! \n> http://vps.bigaston.me/opa/bien_joue.jpg")
    }

    if (inMess(message, ["dur", "difficultée", "difficile", "difficultee"])) {
    	client.say("#" + config.channel, "Vous avez trouvé un meme caché! \n> http://vps.bigaston.me/opa/dur.jpg")
    }

    if (inMess(message, ["memes", "temps"])) {
    	client.say("#" + config.channel, "Vous avez trouvé un meme caché! \n> http://vps.bigaston.me/opa/memes.jpg")
    }

    if (inMess(message, ["opa", "batman", "robin"])) {
    	client.say("#" + config.channel, "Vous avez trouvé un meme caché! \n> http://vps.bigaston.me/opa/memes.jpg")
    }

    if (inMess(message, ["php", "rage", "enervement"])) {
    	client.say("#" + config.channel, "Vous avez trouvé un meme caché! \n> http://vps.bigaston.me/opa/without_php.jpg")
    }
});

// Mise en place des messages d'informations et de soutiens d'Apartar Science
setInterval(function(){client.action("#" + config.channel, messageTime.flatten("#origin#"))}, 600000);

// Envoit des messages aux nouveaux arrivants!
client.addListener("join", function(channel, who) {
	if (who == config.username) {return;}
	client.say(channel, "Bienvenue " + who + " dans le canal d'interraction avec votre assistant personnel, le " + config.username + "! Utiliser !help pour avoir de l'aide!");
});

// Envoit les erreures dans la console
client.addListener('error', function(message) {
    console.log('error: ', message);
});