import type { PoolConnection } from 'mysql';

enum MenuOperationQuery {
    AddItem = `
        INSERT INTO 
            menu_item (parent_id, is_available)
        VALUES
            (?, TRUE)
    `,
    Get = `
        SELECT * FROM MenuItemsDescribed
    `,
};

interface MenuOperation {
    AddItem: {
        Action: (
            pool: PoolConnection,
            payload: Pick<MenuItem, 'parent_id' | 'title' | 'detail' | 'price'>
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

            const menuTree = fromMenuItemListToMenuTree(parsed);

            resolve({ found: true, menu: menuTree });
        });
    });
};

function fromMenuItemListToMenuTree(items: MenuItem[]): Menu {
    const itemsAsNodesMap = new Map<number, MenuItemNode>();

    // Create a mapping of items by their IDs
    for (const item of items) {
        const { parent_id, is_available, ...rest } = item;

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

const Menu = {
    Get,
};

export default Menu;
