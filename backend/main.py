from fastapi import FastAPI

from backend.db_setup import initialize_courses
from backend.routers.course_router import router as router

app = FastAPI()

app.include_router(router)

initialize_courses.initialize_db_elements('https://hooslist.virginia.edu/CourseCatalog/Index', 'https://sisuva.admin.virginia.edu/psc/ihprd/UVSS/SA/s/WEBLIB_HCX_CM.H_CLASS_SEARCH.FieldFormula.IScript_ClassSearch?institution=UVA01&term=1268')


