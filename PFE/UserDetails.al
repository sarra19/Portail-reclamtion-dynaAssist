table 50106 "User_Details"
{
    DataClassification = ToBeClassified;

    fields
    {
        field(1; "No_"; Code[255]) { }

        field(20; "FirstName"; Text[100]) { }
        field(40; "LastName"; Text[100]) { }
        field(50; "Email"; Text[255]) { }
        field(60; "Password"; Text[255]) { }
        field(100; "ProfileImage"; Text[2000]) { }
        field(110; "City"; Text[255])
        { }
        field(120; "PostalCode"; Text[20])
        {
        }
        field(130; "Biography"; Text[2048])
        { }
        field(140; "Gender"; Text[20])
        { }
        field(150; "Phone"; Text[20])
        { }
        field(160; "Role"; Option)
        {
            Caption = 'Role';
            OptionMembers = admin,customer,vendor;
            OptionCaption = 'Admin, Customer, Vendor';
        }
        field(170; "Verified"; Boolean)
        {
        }


        field(180; "Secret"; Text[255])
        { }
        field(190; "Country"; Text[255])
        {
        }
        field(200; "Address"; Text[255])
        {
        }
        field(201; "OccupationUser"; Text[255]) { }
        field(202; "CompagnyUser"; Text[255]) { }

        field(203; "CreatedAt"; DateTime)
        {
            DataClassification = SystemMetadata;
        }

        field(204; "UpdatedAt"; DateTime)
        {
            DataClassification = SystemMetadata;
        }
        field(205; descriptor; Text[255])
        {
          
        }

        field(206; "Provider "; Text[255])
        {
        }
        field(207; "ProfileId "; Text[255])
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

    // Triggers to handle timestamps
    trigger OnInsert()
    begin
        "CreatedAt" := CurrentDateTime;
        "UpdatedAt" := CurrentDateTime;
    end;

    trigger OnModify()
    begin
        "UpdatedAt" := CurrentDateTime;
    end;


}