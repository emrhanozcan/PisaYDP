function toSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

const GLOBALLY_RESTRICTED_KEYS = new Set([
    'full_name', 'fullName', 'fullname', 'fullname_tr', 'Full_Name',
    'search_text', 'searchText', 'searchtext', 'Search_Text',
    'full_text_search', 'fulltextsearch', 'Full_Text_Search',
    'is_ydp', 'isYDP'
]);

function mapToSnakeCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map(v => mapToSnakeCase(v));
    } else if (obj !== null && typeof obj === 'object') {
        const result = {};
        for (const key of Object.keys(obj)) {
            if (GLOBALLY_RESTRICTED_KEYS.has(key)) {
                console.log(`SKIPPING key: ${key}`);
                continue;
            }

            const snakeKey = toSnakeCase(key);
            if (GLOBALLY_RESTRICTED_KEYS.has(snakeKey)) {
                console.log(`SKIPPING snakeKey: ${snakeKey} (from ${key})`);
                continue;
            }

            result[snakeKey] = mapToSnakeCase(obj[key]);
        }
        return result;
    }
    return obj;
}

// TEST CASES
const testObj = {
    id: '123',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    full_name: 'John Doe',
    photoUrl: 'http://...',
    isYDP: true,
    Search_Text: 'abc'
};

console.log('Input:', testObj);
const result = mapToSnakeCase(testObj);
console.log('Output:', result);

if (result.full_name || result.fullName || result.full_text_search || result.is_ydp) {
    console.error('FAILED: Restricted keys still present!');
} else {
    console.log('PASSED: All restricted keys removed.');
}
