// ==UserScript==
// @name        OSM diaries TOC
// @namespace   https://github.com/marcows
// @description Adds a table of contents to the OpenStreetMap diaries page and highlights new posts and comments.
// @description:de Fügt ein Inhaltsverzeichnis zur OpenStreetMap Benutzer-Blogs-Seite hinzu und hebt neue Beiträge und Kommentare hervor.
// @include     *://www.openstreetmap.org/diary*
// @include     /^https?://www\.openstreetmap\.org/user/.*/diary[^/]*$/
// @version     2.0.1
// @license     WTFPL
// @icon        http://www.openstreetmap.org/assets/osm_logo.png
// @supportURL  https://github.com/marcows/osm-diaries-toc
// @compatible  firefox
// @compatible  chrome
// @compatible  opera
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

var diaryPosts = document.querySelectorAll(".diary_post");

var articleLinks = document.querySelectorAll(".diary_post .post_heading h2 > a");
var commentLinks = document.querySelectorAll(".diary_post .secondary-actions a[href$=comments]");

var toc = document.createElement("table");
var olderNewer = document.createElement("span");

/* Create table of contents. */
for (var i = 0; i < articleLinks.length && i < commentLinks.length; i++) {
	var articleLink = articleLinks[i].cloneNode(true);
	var commentLink = commentLinks[i].cloneNode(true);

	var tablerow = document.createElement("tr");
	var cell, link;

	// Anchor name of the (original) article if not existing yet
	if (!articleLinks[i].name)
		articleLinks[i].name = "article" + i;

	/* Column 1: anchor link for scrolling down to article */
	link = document.createElement("a");
	link.innerHTML = "&dArr;";
	link.href = "#" + articleLinks[i].name;

	cell = document.createElement("td");
	cell.appendChild(link);
	tablerow.appendChild(cell);

	/* Column 2: link to article in own page */
	cell = document.createElement("td");
	cell.appendChild(articleLink);
	tablerow.appendChild(cell);

	/* Column 3: link to article comments in own page */

	// Highlighted if changed since last visit (new comments or entire new post)
	// Diary entry ID:
	var key = commentLink.href.match(/\/([0-9]+)#/)[1];
	// Language dependent text, e.g. "No comments", "1 comment", "2 comments" etc.:
	var newVal = commentLink.textContent;
	var oldVal = GM_getValue(key);

	if (newVal !== oldVal) {
		commentLink.style.color = "red";
		// Add the previous content as link title
		commentLink.title = oldVal ? oldVal : "-";

		GM_setValue(key, newVal);
	}

	cell = document.createElement("td");
	cell.appendChild(commentLink);
	tablerow.appendChild(cell);

	toc.appendChild(tablerow);
}

document.querySelector(".content-body .content-inner").insertBefore(toc, document.querySelector(".diary_post"));

/* Duplicate the "older/newer entries" links from bottom of page to after the TOC. */
if (diaryPosts.length > 0) {
	var olderNewerNode = diaryPosts[diaryPosts.length - 1];

	while (olderNewerNode.nextSibling) {
		olderNewerNode = olderNewerNode.nextSibling;
		olderNewer.appendChild(olderNewerNode.cloneNode(true));
	}

	document.querySelector(".content-body .content-inner").insertBefore(olderNewer, document.querySelector(".diary_post"));
}
