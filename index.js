addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request))
})


// Handle URL directing
async function handleRequest(request) {
	// Direct to site and grab JSON
	var json = await fetch('https://cfw-takehome.developers.workers.dev/api/variants')
	.then((response) => {
		return response.json();
	})
	var urlArray = json["variants"];
	
	// Check if the user has visited here before
	// If so, direct them to their previous result site
	// If not, randomly select one of the two given URLs
	var result;
	var cookies = request.headers.get("Cookie") || "";
	if (cookies.includes("result=0")) {
		result = 0;
	} else if (cookies.includes("result=1")) {
		result = 1;
	} else {
		result = Math.round(Math.random());
	}
	
	// Fetch request to one of the two given URLs
	var response = await fetch(urlArray[result])
	.then((response) => {
		return response;
	})
	
	if (result == 0) { // Result 1 changes
		response = new HTMLRewriter().on('title', new ElementHandler('Result 1')).transform(response);
		response = new HTMLRewriter().on('h1#title', new ElementHandler('Result 1')).transform(response);
		response = new HTMLRewriter().on('p#description', new ElementHandler('Congrats on getting Result 1! I hope you enjoy this jazzy purple button.')).transform(response);
		response = new HTMLRewriter().on('a#url', new ElementHandler('Check out my LinkedIn!')).transform(response);
		response = new HTMLRewriter().on('a', new AttributeRewriter('href')).transform(response);
		response.headers.set("Set-Cookie", "result=0");
	} else { // Result 2 changes
		response = new HTMLRewriter().on('title', new ElementHandler('Result 2')).transform(response);
		response = new HTMLRewriter().on('h1#title', new ElementHandler('Result 2')).transform(response);
		response = new HTMLRewriter().on('p#description', new ElementHandler('Great job getting Result 2! To reward your hard work, you get a green button.')).transform(response);
		response = new HTMLRewriter().on('a#url', new ElementHandler('Let\'s connect!')).transform(response);
		response = new HTMLRewriter().on('a', new AttributeRewriter('href')).transform(response);
		response.headers.set("Set-Cookie", "result=1");
	}
	return response;
}

// Replace website text
class ElementHandler {
	constructor(replacement) {
		this.replacement = replacement
	}

	element(element) {
		element.setInnerContent(this.replacement);
	}
}

// Replace website links
class AttributeRewriter {
	constructor(attributeName) {
    	this.attributeName = attributeName;
    }
 
	element(element) {
		const attribute = element.getAttribute(this.attributeName)
		if (attribute) {
			element.setAttribute(
				this.attributeName,
				attribute.replace('https://cloudflare.com', 'https://www.linkedin.com/in/cvturner/')
			)
		}
	}
}