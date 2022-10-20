chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("news.ycombinator.com/item")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      itemId: urlParameters.get("id"),
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
    // Page actions are disabled by default and enabled on select tabs
    chrome.action.disable();
  
    // Clear all rules to ensure only our expected rules are set
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
      // Declare a rule to enable the action on example.com pages
      let exampleRule = {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostSuffix: 'news.ycombinator.com'},
          })
        ],
        actions: [new chrome.declarativeContent.ShowAction()],
      };
  
      // Finally, apply our new array of rules
      let rules = [exampleRule];
      chrome.declarativeContent.onPageChanged.addRules(rules);
    });
  });