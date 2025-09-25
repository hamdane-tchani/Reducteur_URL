/* eslint-disable no-console */
// ici l'adresse et le port DU SERVEUR NODE
import { html, render } from "https://esm.run/lit-html";

const apiServer = "http://localhost:3000";
const $description = document.querySelector("#app-subtitle");
const $result = document.querySelector("#generated-link");
const $footer = document.querySelector("footer");
const $form = document.querySelector("#create-link");

const $successTemplate = document.querySelector("#success-template");

const $failureTemplate = document.querySelector("#failure-template");


async function getAPI(path = "/") {
  const url = new URL(path, apiServer);
  const resp = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!resp.ok) {
    throw new Error(`HTTP error! status: ${resp.status}`);
  }
  return await resp.json();
}

async function updateFooter() {
  const { version, name, serverUri } = await getAPI("/health");
  const { links_count } = await getAPI("/api");

  $description.textContent = `Already ${links_count} links!`;

  const result = html`
    <div @click=${() => console.log("ok")}>
      <p>
        Served on ${new Date().toLocaleString()} from
        <a href="${window.location.origin}">${window.location.origin}</a>. API
        <span>${name}</span> v.${version} on <a href="${serverUri}">${serverUri}</a>.
      </p>
      <p>
        See the
        <a href="http://lifweb.pages.univ-lyon1.fr/TP6-WebApp/">LIFWEB homepage</a>
        for more information.
      </p>
    </div>
  `;
  render(result, $footer);
}

$form.addEventListener("submit", async (event) => { //On écoute le moment où l’utilisateur soumet le formulaire
  event.preventDefault(); //On empêche la page de se recharger
  try {
    const formData = new FormData($form);
    const jsonData = Object.fromEntries(formData.entries()); //On convertit ces données en objet JS { uri: "..." }
    const url = new URL("/api", apiServer);
    const response = await fetch(url, { //On envoie une requête POST à http://localhost:3000/api avec les données
      method: "POST",
      body: JSON.stringify(jsonData),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const createdLink = await response.json();//On récupère la réponse de l’API (le lien raccourci)
    console.info(createdLink); //On l’affiche dans la console (pour debug)

    const $content = $successTemplate.content.cloneNode(true); 
    const $anchor = $content.querySelector("a");
    $anchor.href = createdLink.uri;
    $anchor.textContent = createdLink.uri;
    const $copyButton = $content.querySelector("#copy");

    $copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(createdLink.uri);
      $copyButton.querySelector("i").textContent = "✅";
    });

    $result.replaceChildren($content);
  } catch (error) {
    const $content = $failureTemplate.content.cloneNode(true);
    $content.querySelector("div").textContent = error.message;
    $result.replaceChildren($content);
  } finally {
    await updateFooter();
  }
});

await updateFooter();
