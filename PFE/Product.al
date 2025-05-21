table 50109 "Product"
{
    DataClassification = ToBeClassified;

    fields
    {
        field(1; "No_"; Integer)
        {
            AutoIncrement = true;
        }
        field(2; "ImageProduct"; Text[255])
        {
            NotBlank = false;

        }
        field(3; "Name"; Text[100])
        {

            NotBlank = true;
        }
        field(4; "Description"; Text[2048])
        {
            NotBlank = false;

        }
        field(5; "Price"; Decimal)
        {
            NotBlank = false;

        }
        field(6; "Tags"; Text[255])
        {
            NotBlank = false;
        }
        field(7; "Vendor"; Text[255])
        {
            NotBlank = true;

        }

        field(8; "VendorId"; Text[255])
        {
            NotBlank = true;

        }
    }

}