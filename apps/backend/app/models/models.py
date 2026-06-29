import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SQLEnum, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship
import enum
from geoalchemy2 import Geography

Base = declarative_base()

class ReportType(str, enum.Enum):
    noise = "noise"
    maintenance = "maintenance"
    safety = "safety"
    management = "management"
    other = "other"

class AIAnalysisStatus(str, enum.Enum):
    pending = "pending"
    analyzing = "analyzing"
    completed = "completed"
    failed = "failed"

class RiskLevel(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True) # References auth.users
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    reputation_score = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=text("timezone('utc', now())"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text("timezone('utc', now())"), nullable=False)

    reports = relationship("Report", back_populates="reporter")

class Property(Base):
    __tablename__ = "properties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    location = Column(Geography(geometry_type='POINT', srid=4326), nullable=False)
    trust_score = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("timezone('utc', now())"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text("timezone('utc', now())"), nullable=False)

    reports = relationship("Report", back_populates="property", cascade="all, delete-orphan")

class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    report_type = Column(SQLEnum(ReportType), nullable=False)
    description = Column(String, nullable=False)
    ai_analysis_status = Column(SQLEnum(AIAnalysisStatus), default=AIAnalysisStatus.pending)
    ai_summary = Column(String, nullable=True)
    risk_level = Column(SQLEnum(RiskLevel), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("timezone('utc', now())"), nullable=False)

    property = relationship("Property", back_populates="reports")
    reporter = relationship("Profile", back_populates="reports")
