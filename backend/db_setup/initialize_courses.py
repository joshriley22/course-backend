from backend.db_setup.scrape_hoolist_manager import initialize_rels
from backend.db_setup.sis_api_manager import initialize_courses, initialize_classes


def initialize_db_elements(catalog_url, sis_api_url):
    initialize_courses(sis_api_url)
    initialize_rels(catalog_url)
    initialize_classes(sis_api_url)



