const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

function removeUrlsIds(html) {
    // Expresión regular para encontrar "{#...}"
    var regex = /\{#[^\}]*\}/g;
    // Reemplazar todas las coincidencias con un string vacío
    return html.replace(regex, '');
}

async function fetchMarkdown(owner, repo, path, branch) {
    try {
        const token = process.env.GITHUB_ACCESS_TOKEN;
        const response = await axios.get(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`, {
            headers: {
                Authorization: `token ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error('Error al obtener el contenido del archivo Markdown');
    }
}

app.get('/markdown/:path', async (req, res) => {
    try {
        // const { path } = String((req.params.path).replace('html', 'md'));
        // const pathPrincipal = path.indexOf('#') > -1 ? path.split('#')[0] : path;
        const owner = process.env.GITHUB_OWNER;
        const repo = process.env.GITHUB_REPO;
        const branch = process.env.GITHUB_REPO_BRANCH;
        const markdownContent = await fetchMarkdown(owner, repo, req.params.path, branch);

        const showdown = require('showdown'),
            converter = new showdown.Converter(),
            html = removeUrlsIds(converter.makeHtml(markdownContent));
        res.json({
            message: `Content ok`,
            html
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error al obtener el contenido del archivo Markdown. Comprueba si el fichero seleccionado es el correcto',
            html: ``
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});