import requests
from bs4 import BeautifulSoup

from backend.db_setup.scrape_hoolist_page_manager import create_relationship_from_catalog


def initialize_rels(url):
    html = get_frontpage_html(url)
    links = get_links_from_html(html)
    for link in links:
        real_link = link
        if real_link.startswith("/"):
            real_link = "https://hooslist.virginia.edu" + real_link
        create_relationship_from_catalog(real_link)


def get_frontpage_html(url):
    try:
        response = requests.get(url)
        html = BeautifulSoup(response.text, 'html.parser')
        return html
    except Exception as e:
        print(e)

def get_links_from_html(html):
    link_tab = html.find_all(class_="accordion-body")
    links = []
    for link_tab_ in link_tab:
        headers = link_tab_.find_all('a', class_='text-decoration-none')
        for header in headers:
            links.append(header.get('href'))
    return links