try {
  var session = window.sessionStorage || {};
} catch (e) {
  var session = {};
}

window.addEventListener("DOMContentLoaded", () => {
  const allTabs = document.querySelectorAll('.sphinx-tabs-tab');
  const tabLists = document.querySelectorAll('[role="tablist"]');

  allTabs.forEach(tab => {
    tab.addEventListener("click", changeTabs);
  });

  tabLists.forEach(tabList => {
    tabList.addEventListener("keydown", keyTabs);
  });

  // Restore group tab selection from session
  const lastSelected = session.getItem('sphinx-tabs-last-selected');
  if (lastSelected != null) selectNamedTabs(lastSelected);
});

/**
 * Key focus left and right between sibling elements using arrows
 * @param  {Node} e the element in focus when key was pressed
 */
function keyTabs(e) {
    const tab = e.target;
    let nextTab = null;
    if (e.keyCode === 39 || e.keyCode === 37) {
      tab.setAttribute("tabindex", -1);
      // Move right
      if (e.keyCode === 39) {
        nextTab = tab.nextElementSibling;
        if (nextTab === null) {
          nextTab = tab.parentNode.firstElementChild;
        }
      // Move left
      } else if (e.keyCode === 37) {
        nextTab = tab.previousElementSibling;
        if (nextTab === null) {
          nextTab = tab.parentNode.lastElementChild;
        }
      }
    }

    if (nextTab !== null) {
      nextTab.setAttribute("tabindex", 0);
      nextTab.focus();
    }
}

/**
 * Select or deselect clicked tab. If a group tab
 * is selected, also select tab in other tabLists.
 * @param  {Node} e the element that was clicked
 */
function changeTabs(e) {
  // Use this instead of the element that was clicked, in case it's a child
  const notSelected = this.getAttribute("aria-selected") === "false";
  const positionBefore = this.parentNode.getBoundingClientRect().top;
  const notClosable = !this.parentNode.classList.contains("closeable");

  deselectTabList(this);

  if (notSelected || notClosable) {
    selectTab(this);
    const name = this.getAttribute("name");
    selectNamedTabs(name, this.id);

    if (this.classList.contains("group-tab")) {
      // Persist during session
      session.setItem('sphinx-tabs-last-selected', name);
    }
  }

  const positionAfter = this.parentNode.getBoundingClientRect().top;
  const positionDelta = positionAfter - positionBefore;
  // Scroll to offset content resizing
  window.scrollTo(0, window.scrollY + positionDelta);
}

/**
 * Select tab and show associated panel.
 * @param  {Node} tab tab to select
 */
function selectTab(tab) {
  tab.setAttribute("aria-selected", true);

  // Show the associated panel
  document
    .getElementById(tab.getAttribute("aria-controls"))
    .removeAttribute("hidden");
}

/**
 * Hide the panels associated with all tabs within the
 * tablist containing this tab.
 * @param  {Node} tab a tab within the tablist to deselect
 */
function deselectTabList(tab) {
  const parent = tab.parentNode;
  const grandparent = parent.parentNode;

  Array.from(parent.children)
  .forEach(t => t.setAttribute("aria-selected", false));

  Array.from(grandparent.children)
    .slice(1)  // Skip tablist
    .forEach(panel => panel.setAttribute("hidden", true));
}

/**
 * Select grouped tabs with the same name, but no the tab
 * with the given id.
 * @param  {Node} name name of grouped tab to be selected
 * @param  {Node} clickedId id of clicked tab
 */
function selectNamedTabs(name, clickedId=null) {
  const groupedTabs = document.querySelectorAll(`.sphinx-tabs-tab[name="${name}"]`);
  const tabLists = Array.from(groupedTabs).map(tab => tab.parentNode);

  tabLists
    .forEach(tabList => {
      // Don't want to change the tabList containing the clicked tab
      const clickedTab = tabList.querySelector(`[id="${clickedId}"]`);
      if (clickedTab === null ) {
        // Select first tab with matching name
        const tab = tabList.querySelector(`.sphinx-tabs-tab[name="${name}"]`);
        deselectTabList(tab);
        selectTab(tab);
      }
    })
}
//UMD pattern to export function for testing
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return {
        keyTabs: keyTabs,
        changeTabs: changeTabs,
        selectTab: selectTab,
        deselectTabList: deselectTabList,
        selectNamedTabs: selectNamedTabs
    };
}));

