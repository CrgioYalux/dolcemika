function fromMenuItemListToMenuTree(items: MenuItem[], options: { onlyAvailableItems?: boolean } = { onlyAvailableItems: false }): Menu {
    const itemsAsNodesMap = new Map<number, MenuItemNode>();

    // Create a mapping of items by their IDs
    for (const item of items) {
        const { parent_id, is_available, ...rest } = item;

        if (options.onlyAvailableItems && !is_available) continue;

        itemsAsNodesMap.set(item.id, {
            is_available: is_available ? true : false,
            ...rest,
            children: [],
        });
    }

    const tree: Menu = [];

    for (const item of items) {
        const node = itemsAsNodesMap.get(item.id);
        if (!node) continue;

        if (item.parent_id === null) {
            // This must be a root node
            tree.push(node);
        } else {
            // Add the node as a child of its parent
            const parent = itemsAsNodesMap.get(item.parent_id);
            if (parent) {
                parent.children.push(node);
            }
        }
    }

    return tree;
};

export { fromMenuItemListToMenuTree };
