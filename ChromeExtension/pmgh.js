var inject_configuration = { "xib files": [".xib", ".nib"], "project files": [".pbxproj"], "asset files": [".xcassets/"] }

function inject_changes(configuration) {
    var headers = document.querySelectorAll(".file-header");
    for (var i = 0; i < headers.length; i++) {
        var header = headers[i];
        var dataPath = header.attributes["data-path"];
        if (!dataPath) {
            continue;
        }
                
        var matchesConfiguration = false;
        var matchingConfiguration = [];
        for (var key in configuration) {
            let patterns = configuration[key];
            for (var j = 0; j < patterns.length; j++) {
                var re = new RegExp(patterns[j]);
                if (re.test(dataPath.value)) {
                    matchingConfiguration.push(key);
                    matchesConfiguration = true;
                }
            }
        }

        if (!matchesConfiguration) {
            continue;
        }
        
        var actions = header.querySelector(".file-actions .mt-1") || header.querySelector(".file-actions");
        var button = actions.querySelector("a.known-collapse")
        if (!button) {
            button = document.createElement("a");
            button.href = "javascript:void(0)";
            button.rel = "nofollow";
            
            actions.appendChild(button);

            let github_enterprise_built_in_collapse_button = actions.querySelector(".btn-octicon.p-1");
            if (github_enterprise_built_in_collapse_button) {
                github_enterprise_built_in_collapse_button.remove();
            }
            
            button.addEventListener("click", function(event) {
                handleCollapseClick(event.target);
            });

            let event = new Event("click");
            button.dispatchEvent(event);
        }

        let toolbar = document.querySelector(".pr-toolbar");
        let toolbarShadow = document.querySelector(".pr-toolbar-shadow") || document.querySelector(".toolbar-shadow")
        if (toolbar && toolbarShadow && toolbar.style.height != "100px") {
            toolbar.style.height = "100px";
            toolbarShadow.style.top = "100px";
        }

        var buttonsContainer = document.getElementById("pmgh-toggle_container");
        
        if (!buttonsContainer) {
            buttonsContainer = document.createElement("div");     
            buttonsContainer.setAttribute("id", "pmgh-toggle_container");
            toolbar.appendChild(buttonsContainer);
        }

        var toolbarButton;
        if (matchingConfiguration.length > 0) {
            let toolbarButtonId = matchingConfiguration[0].toLowerCase().replace(/\s/gi, "_");
            toolbarButton = addToolbarButtonIfNeeded(buttonsContainer, toolbarButtonId, matchingConfiguration[0], configuration[matchingConfiguration[0]]);
        }

        header.parentElement.hidden = toolbarButton.innerHTML.startsWith("Show ");
    }
}

function addToolbarButtonIfNeeded(container, id, groupName, matches) {
    let button = document.getElementById(id)
    if (button) {
        return button;
    } else {
        return container.appendChild(makeToolbarButton(id, groupName, matches));
    }
}

function makeToolbarButton(id, groupName, matches) {
    let button = document.createElement("a");
    button.href = "javascript:void(0)";
    button.rel = "nofollow";
    button.setAttribute("id", id);
    button.style.marginTop = "15px";
    button.style.marginRight = "10px";

    let showMessage = "Show " + groupName
    let hideMessage = "Hide " + groupName
    
    button.addEventListener("click", function(event) {
        let target = event.target;
        if (target.innerHTML) { // button already setup
            handleToggleClick(target, matches);
        }
        if (target.innerHTML == hideMessage) {
            target.setAttribute("aria-label", showMessage);
            target.innerHTML = showMessage;
            target.className = "btn btn-sm known-collapse";
        } else {
            target.setAttribute("aria-label", hideMessage);
            target.innerHTML = hideMessage;
            target.className = "btn btn-sm btn-blue known-collapse";
        }
    });

    let event = new Event("click");
    button.dispatchEvent(event);

    return button;
}

function handleCollapseClick(button) {
    var buttonParent = button.parentElement;
    for (var i = 0; i < 3; i++) {
        if (buttonParent.classList.contains("file-header")) {
            break;
        }
     
        buttonParent = buttonParent.parentElement;
    }

    var diffElement = buttonParent.nextElementSibling;
    diffElement.hidden = !diffElement.hidden;
    if (diffElement.hidden) {
        button.className = "btn btn-sm btn-blue known-collapse";
        button.setAttribute("aria-label", "Expand file");
        button.innerHTML = "Expand";    
    } else {
        button.className = "btn btn-sm known-collapse";
        button.setAttribute("aria-label", "Collapse file");
        button.innerHTML = "Collapse";
    }
}

function handleToggleClick(button, matches) {
    var headers = document.querySelectorAll(".file-header");
    for (var i = 0; i < headers.length; i++) {
        var header = headers[i];
        var dataPath = header.attributes["data-path"];
        if (!dataPath) {
            continue;
        }

        var shouldHide = false
        for (var j = 0; j < matches.length; j++) {
            var re = new RegExp(matches[j]);

            shouldHide |= re.test(dataPath.value);
        }

        if (shouldHide) {
            header.parentElement.hidden = button.innerHTML.startsWith("Hide ");
        }
    }
}

function initializeListener() {
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            inject_changes(inject_configuration);
        });
    });

    var config = {
        attributes: false,
        childList: true,
        characterData: true,
        subtree: true
    };
    observer.observe(document.body, config);
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", function() {
        initializeListener()
   });
} else {
    initializeListener()
}

inject_changes(inject_configuration);
