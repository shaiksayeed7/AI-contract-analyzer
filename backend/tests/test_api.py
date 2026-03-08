"""
Test suite for LexiScan AI backend.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.main import app
from app.core.database import Base, get_db

TEST_DB_URL = "sqlite+aiosqlite:///./test_lexiscan.db"

test_engine = create_async_engine(TEST_DB_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        from app import models  # noqa
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "LexiScan AI"


@pytest.mark.asyncio
async def test_root(client):
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "LexiScan AI"


@pytest.mark.asyncio
async def test_list_contracts_empty(client):
    response = await client.get("/api/contracts/")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_register_user(client):
    response = await client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "Password123!", "full_name": "Test User"},
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    payload = {"email": "dupe@example.com", "password": "Password123!"}
    await client.post("/api/auth/register", json=payload)
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login(client):
    await client.post(
        "/api/auth/register",
        json={"email": "login@example.com", "password": "Password123!"},
    )
    response = await client.post(
        "/api/auth/login",
        json={"email": "login@example.com", "password": "Password123!"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post(
        "/api/auth/register",
        json={"email": "bad@example.com", "password": "correct"},
    )
    response = await client.post(
        "/api/auth/login",
        json={"email": "bad@example.com", "password": "wrong"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_contract_not_found(client):
    response = await client.get("/api/contracts/nonexistent-id")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_upload_invalid_type(client):
    response = await client.post(
        "/api/contracts/upload",
        files={"file": ("test.exe", b"binary content", "application/octet-stream")},
    )
    assert response.status_code == 400
