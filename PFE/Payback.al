table 50115 "Payback"
{
    DataClassification = ToBeClassified;

    fields
    {
        field(1; "No_"; Integer)
        {
            AutoIncrement = true;
        }
        field(2; "Montant"; Decimal)
        {
            NotBlank = true;
        }
        field(3; "DatePrevu"; Date)
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