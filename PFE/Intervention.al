table 50116 "Intervention"
{
    DataClassification = ToBeClassified;

    fields
    {
        field(1; "No_"; Integer)
        {
            AutoIncrement = true;
        }
        field(2; "DatePrevuInterv"; Date)
        {
            NotBlank = true;
        }
        field(3; "TechnicienResponsable"; Text[50])
        {
            NotBlank = true;
        }
        field(4; "ReponseId"; Integer)
        {
        }
    }

    keys
    {
        key(PK; "No_")
        {
            Clustered = true;
        }
    }
}