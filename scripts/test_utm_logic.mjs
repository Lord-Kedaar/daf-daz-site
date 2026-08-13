// UTM capture logic test — mirrors the exact logic in assets/js/main.js
// Runs in node with a fake window.location; no DOM needed for the pure logic.

function captureUtm(url) {
    const u = new URL(url);
    const urlParams = u.searchParams;
    const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'landing_page'];
    const result = {};
    utmFields.forEach(name => {
        if (name === 'landing_page') {
            result[name] = u.pathname + u.search;
        } else {
            const value = urlParams.get(name);
            if (value) {
                result[name] = value;
            }
        }
    });
    return result;
}

const cases = [
    {
        name: 'with full UTM set',
        url: 'https://daf-daz.radoslaw-pleskot.com/?utm_source=google&utm_medium=cpc&utm_campaign=winter&utm_content=hero&utm_extra=ignored',
        expect: { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'winter', utm_content: 'hero', landing_page: '/?utm_source=google&utm_medium=cpc&utm_campaign=winter&utm_content=hero&utm_extra=ignored' }
    },
    {
        name: 'partial UTM (only source)',
        url: 'https://daf-daz.radoslaw-pleskot.com/pl/?utm_source=newsletter',
        expect: { utm_source: 'newsletter', landing_page: '/pl/?utm_source=newsletter' }
    },
    {
        name: 'no UTM at all',
        url: 'https://daf-daz.radoslaw-pleskot.com/',
        expect: { landing_page: '/' }
    },
    {
        name: 'landing page with UTM',
        url: 'https://daf-daz.radoslaw-pleskot.com/deutsch-privatunterricht-wien/?utm_source=facebook&utm_campaign=privat',
        expect: { utm_source: 'facebook', utm_campaign: 'privat', landing_page: '/deutsch-privatunterricht-wien/?utm_source=facebook&utm_campaign=privat' }
    },
    {
        name: 'empty UTM values are ignored (fail-safe)',
        url: 'https://daf-daz.radoslaw-pleskot.com/?utm_source=&utm_medium=',
        expect: { landing_page: '/?utm_source=&utm_medium=' }
    }
];

let pass = 0;
for (const c of cases) {
    const got = captureUtm(c.url);
    const ok = JSON.stringify(got) === JSON.stringify(c.expect);
    if (ok) {
        pass++;
        console.log(`PASS  ${c.name}`);
    } else {
        console.log(`FAIL  ${c.name}`);
        console.log(`  got:      ${JSON.stringify(got)}`);
        console.log(`  expected: ${JSON.stringify(c.expect)}`);
    }
}
console.log(`\n${pass}/${cases.length} UTM cases passed`);
process.exit(pass === cases.length ? 0 : 1);
