"use client";

import { useEffect } from "react";

export function HydrationFix() {
  useEffect(() => {
    // Remove Grammarly and other browser extension attributes that cause hydration mismatches
    const removeExtensionAttributes = () => {
      const body = document.body;
      const html = document.documentElement;
      
      // List of known browser extension attributes that cause hydration issues
      const extensionAttributes = [
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
        'data-gramm',
        'data-gramm_editor',
        'data-wf-page',
        'data-wf-site',
        'cz-shortcut-listen'
      ];
      
      // Remove from body
      extensionAttributes.forEach(attr => {
        if (body.hasAttribute(attr)) {
          body.removeAttribute(attr);
        }
        if (html.hasAttribute(attr)) {
          html.removeAttribute(attr);
        }
      });
    };

    // Run immediately
    removeExtensionAttributes();
    
    // Also run after a short delay to catch any late-loading extensions
    const timeoutId = setTimeout(removeExtensionAttributes, 100);
    
    // Set up a mutation observer to remove extension attributes as they're added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          const attrName = mutation.attributeName;
          
          if (attrName && (
            attrName.startsWith('data-gr-') ||
            attrName.startsWith('data-gramm') ||
            attrName.includes('grammarly') ||
            attrName === 'cz-shortcut-listen'
          )) {
            target.removeAttribute(attrName);
          }
        }
      });
    });
    
    // Observe changes to body and html elements
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
        'data-gramm',
        'data-gramm_editor',
        'cz-shortcut-listen'
      ]
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
        'data-gramm',
        'data-gramm_editor',
        'cz-shortcut-listen'
      ]
    });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  return null;
}
