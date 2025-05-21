table 50107 "Service"
{
    DataClassification = ToBeClassified;

    fields
    {
        field(1; "No_"; Integer)
        {
            AutoIncrement = true;
        }
        field(2; "Image"; Text[255])
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
        field(6; "Tags"; Text[255])
        {
            NotBlank = false;
        }
     

    }



}