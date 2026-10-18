import pytest


def test_root_endpoint(client):
    """Verifies service banner response."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "running" in data["message"].lower()


def test_health_check_endpoint(client):
    """Verifies service health check and database telemetry."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data
    assert "connected" in data["database"]


def test_db_status_endpoint(client):
    """Verifies detailed real-time MongoDB metrics endpoint."""
    response = client.get("/db-status")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "db" in data


def test_storage_zones_endpoint(client, auth_headers):
    """Verifies 5-zone microclimate telemetry endpoint."""
    response = client.get("/storage/zones", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_zones"] == 5
    zone_ids = [z["zone_id"] for z in data["zones"]]
    assert "zone_chiller" in zone_ids
    assert "zone_quarantine" in zone_ids


def test_storage_workflow_execution(client, auth_headers):
    """Verifies automated environmental mitigation trigger."""
    payload = {
        "zone_id": "zone_chiller",
        "action": "COOLING_BOOST",
        "notes": "Automated verification test"
    }
    response = client.post("/storage/workflows/execute", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["workflow"]["action"] == "COOLING_BOOST"


def test_recommendations_inventory(client, auth_headers):
    """Verifies FEFO prioritization and ethylene conflict recommendation endpoint."""
    response = client.get("/recommendations/inventory", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "fefo_queue" in data
    assert "summary" in data


def test_inventory_insights(client, auth_headers):
    """Verifies inventory health score and impact analytics endpoint."""
    response = client.get("/inventory/insights", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "inventory_health_score" in data
    assert "financial_environmental_impact" in data


def test_executive_summary_endpoint(client, auth_headers):
    """Verifies Milestone 4 Executive Dashboard KPI endpoint."""
    response = client.get("/analytics/executive-summary?time_range=30d", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "kpis" in data
    kpis = data["kpis"]
    assert "protected_value_usd" in kpis
    assert "spoilage_reduction_percent" in kpis
    assert "co2_emissions_avoided_kg" in kpis
    assert "departmental_status" in data


def test_analytics_trends_endpoint(client, auth_headers):
    """Verifies multi-day time-series analytics visualization endpoint."""
    response = client.get("/analytics/trends?days=14", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["trends"]) >= 14
    first_pt = data["trends"][0]
    assert "average_fqi" in first_pt
    assert "compliance_rate" in first_pt


def test_executive_compliance_report(client, auth_headers):
    """Verifies Milestone 4 ISO/HACCP Executive Report generator."""
    response = client.get("/analytics/reports/executive", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "report" in data
    report = data["report"]
    assert "report_id" in report
    assert "certified_by" in report


def test_executive_report_export_csv(client, auth_headers):
    """Verifies CSV export capability for executive compliance reports."""
    response = client.get("/analytics/reports/export?format=csv", headers=auth_headers)
    assert response.status_code == 200
    assert "text/csv" in response.headers.get("content-type", "")
    assert "Batch ID" in response.text
    assert "Produce Item" in response.text


def test_executive_report_export_excel(client, auth_headers):
    """Verifies Excel (.xlsx) export capability for executive compliance reports."""
    response = client.get("/analytics/reports/export?format=excel", headers=auth_headers)
    assert response.status_code == 200
    assert "spreadsheetml" in response.headers.get("content-type", "")
    assert len(response.content) > 1000  # Valid binary Excel spreadsheet


def test_admin_users_endpoint(client, auth_headers):
    """Verifies Administrator user management endpoint."""
    response = client.get("/admin/users", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "users" in data
    assert data["total_users"] >= 1


def test_admin_system_endpoint(client, auth_headers):
    """Verifies Administrator system monitoring and diagnostics."""
    response = client.get("/admin/system", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["system"]["status"] == "OPERATIONAL"
    assert "Consumer" in data["system"]["roles_supported"]
    assert "Administrator" in data["system"]["roles_supported"]
