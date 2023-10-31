import type { PoolConnection } from 'mysql';

enum MenuOperationQuery {
    AddItem = `
        INSERT INTO 
            menu_item (group_id, parent_id, title, detail, price)
        VALUES
            (?, ?, ?, ?)
    `,
    Get = `
        SELECT * FROM menu_item AS mi
    `,
};

interface MenuOperation {
    AddItem: {
        Action: (
            pool: PoolConnection,
            payload: Pick<MenuItem, 'group_id' | 'parent_id' | 'title' | 'detail' | 'price'>
        ) => Promise<{ created: true, menu_item: Pick<MenuItem, 'id'> } | { created: false, message: string }>;
        QueryReturnType: EffectfulQueryResult;
    };
    Get: {
        Action: (
            pool: PoolConnection
        ) => Promise<{ found: true, menu: Menu } | { found: false, message: string }>;
        QueryReturnType: EffectlessQueryResult<MenuItem>;
    };
};

const Get: MenuOperation['Get']['Action'] = (pool) => {
    return new Promise((resolve, reject) => {
        pool.query(MenuOperationQuery.Get, (err, results) => {
            if (err) {
                reject({ getMenuError: err });
                return;
            }

            const parsed = results as MenuOperation['Get']['QueryReturnType'];

            if (!parsed.length) {
                resolve({ found: false, message: 'Could not find menu items' });
                return;
            }

            const orderedByGroups = orderMenuItemListByGroupId(parsed);
            const menuTree: Menu = [];
            
            for (const group of orderedByGroups) {
                menuTree.push(fromMenuItemListToMenuTree(group)[0]);
            }
            
            resolve({ found: true, menu: menuTree });
        });
    });
};

const orderMenuItemListByGroupId = (list: MenuItem[]): MenuItem[][] => {
    const groupsMap = new Map<number, MenuItem[]>();

    list.forEach((item) => {
        const menuItems = groupsMap.get(item.group_id) ?? [];
        menuItems.push(item);
        groupsMap.set(item.group_id, menuItems);
    });

    return Array.from(groupsMap.values());
};

function fromMenuItemListToMenuTree(items: MenuItem[]): Menu {
    const itemMap = new Map<number, MenuItemNode>();

    // Create a mapping of items by their IDs
    for (const item of items) {
        const { group_id, parent_id, ...rest } = item;
        itemMap.set(item.id, {
            ...rest,
            children: [],
        });
    }

    const tree: Menu = [];

    for (const item of items) {
        const node = itemMap.get(item.id);
        if (!node) continue;

        if (item.parent_id === null) {
            // This must be a root node
            tree.push(node);
        } else {
            // Add the node as a child of its parent
            const parent = itemMap.get(item.parent_id);
            if (parent) {
                parent.children.push(node);
            }
        }
    }

    return tree;
};

const Menu = {
    Get,
};

export default Menu;
