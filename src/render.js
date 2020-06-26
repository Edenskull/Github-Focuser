const remote = require('electron').remote;
const Shell = require('electron').shell;
const fs = require('fs');

var config = {
    owner: remote.getGlobal('config').owner,
    repo: remote.getGlobal('config').repository,
    white: remote.getGlobal('config').white
};

function getLastCommit() {
    $.get(`https://api.github.com/repos/${config.owner}/${config.repo}/commits`)
        .done(function(data) {
            var increment = 0;
            var init = false;
            var entries = $('div.subDiv');
            var shaArray = [];
            for(var i = 0; i < entries.length; i++) {
                shaArray.push($(entries[i]).attr('id'))
            }
            data.forEach(row => {
                let message = row.commit.message;
                let committer = row.author.login;
                let commitUrl = row.html_url;
                let userUrl = row.author.html_url;
                let urlPP = row.author.avatar_url;
                let commitDate = row.commit.committer.date;
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const date = new Date(commitDate);
                let sha = row.sha;
                if (shaArray == 0 || init) {
                    init = true;
                    var html = `<div class="subDiv" id="${sha}">
                        <div class="wrapper">
                        <h3 class="title"><a href="${commitUrl}">${message}</a></h3>
                        <img class="pp" src="${urlPP}" alt="PP">
                        </div>
                        <div class="wrapper2">
                        <p>Comitted By : <a class="text-muted" href="${userUrl}">${committer}</a></p>
                        <p>Comitted At : ${date.toLocaleDateString('fr-FR', options)}</p>
                        </div>
                        </div>`
                    $('#container').append(html);
                } else {
                    if (shaArray.indexOf(sha) == -1) {
                        var html = `<div class="subDiv" id="${sha}">
                            <div class="wrapper">
                            <h3 class="title"><a href="${commitUrl}">${message}</a></h3>
                            <img class="pp" src="${urlPP}" alt="PP">
                            </div>
                            <div class="wrapper2">
                            <p>Comitted By : <a class="text-muted" href="${userUrl}">${committer}</a></p>
                            <p>Comitted At : ${date.toLocaleDateString('fr-FR', options)}</p>
                            </div>
                            </div>`
                        $('#container').append(html);
                    }
                }
                increment++;
            });
        }).fail(function(err) {
            console.log(err);
        });
}

function saveConfig(white, owner, repo, reload){
    let data = JSON.stringify({
        "owner": owner,
        "repository": repo,
        "white": white
    }, null, 2);
    config.owner = owner;
    config.repo = repo;
    config.white = white;
    fs.writeFile('src/config.json', data, (err) => {
        if (err) throw err;
    });
    if(white) {
        $('body').addClass('white-text');
    } else {
        $('body').removeClass('white-text');
    }
    if(reload) {
        console.log('pass');
        $('#container').empty();
        getLastCommit();
    }
}

$(document).ready(() => {
    if(config.white) {
        $('body').addClass('white-text');
    } else {
        $('body').removeClass('white-text');
    }

    getLastCommit();

    $('#container').on('click', 'div.subDiv > div.wrapper > h3 > a', (event) => {
        event.preventDefault();
        Shell.openExternal(event.toElement.href);
    });

    $('#container').on('click', 'div.subDiv > div.wrapper2 > p:nth-child(1) > a', (event) => {
        event.preventDefault();
        Shell.openExternal(event.toElement.href);
    });
    
    $('#config').click(() => {
        $('#main').addClass('d-none');
        $('#modal').removeClass('d-none');
        $('#owner').val(config.owner);
        $('#repo').val(config.repo);
        $('#whitetext').attr('checked', config.white);
    });

    $('#save').click(() => {
        let owner = $('#owner').val();
        let repo = $('#repo').val();
        let white = $('#whitetext').is(":checked") ? true : false;
        if(repo != config.repo || owner != config.owner) {
            saveConfig(white, owner, repo, true);
        } else {
            saveConfig(white, owner, repo, false);
        }
    });

    $('#close').click(() => {
        $('#modal').addClass('d-none');
        $('#main').removeClass('d-none');
    });
    
    setInterval(() => {
        getLastCommit();
    }, 60000);
});
