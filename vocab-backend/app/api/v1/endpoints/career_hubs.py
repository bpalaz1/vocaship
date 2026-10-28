from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.schemas.career_hub import CareerHubsResponse, CareerHubItem
from app.services.career_hubs_data import ACADEMIC_HUBS, PROFESSIONAL_HUBS, CAREER_HUBS_DICT

router = APIRouter(prefix="/career-hubs", tags=["Specialized Career Hubs"])


@router.get("", response_model=CareerHubsResponse)
@router.get("/", response_model=CareerHubsResponse)
async def list_career_hubs():
    """
    Tüm mesleki ve akademik dikey ağacını listeler:
    - academic: ['yds_yokdil', 'ielts_toefl']
    - professional: 9 mesleki hub (project_management, project_controls, civil, process_chem, mechanical, medical, legal, finance, tech_executive)
    """
    return CareerHubsResponse(
        academic=ACADEMIC_HUBS,
        professional=PROFESSIONAL_HUBS
    )


@router.get("/{hub_key}", response_model=CareerHubItem)
async def get_career_hub(hub_key: str):
    """Belirli bir meslek/akademik dalın hazır kartlarını, vaka okumasını ve speaking senaryo detaylarını döner."""
    hub = CAREER_HUBS_DICT.get(hub_key)
    if not hub:
        raise HTTPException(status_code=404, detail=f"'{hub_key}' mesleki dikey bulunamadı.")
    return hub
